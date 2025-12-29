// @ts-expect-error deno-types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error deno-types
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error deno-types
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.20.1'
import { corsHeaders } from '../_shared/cors.ts'
// @ts-expect-error deno-types
import { extractText } from 'https://esm.sh/unpdf@0.11.0'

interface AIConfig {
  prompt_text: string
  provider: string
  model_name: string
  max_output_tokens: number
  temperature: number
  thinking_budget?: number
}

interface ContextData {
  org?: { name?: string; culture_description?: string; token_balance?: number };
  funnel_stats?: Record<string, number>;
  focused_entity?: {
    type: string;
    id: string;
    data: Record<string, unknown>;
    test_results?: Array<Record<string, unknown>>;
    interviews?: Array<Record<string, unknown>>;
  };
}

const OPERATION_TYPE = 'ai_assistant'

const TOOLS = [
  {
    name: 'search_candidates',
    description: 'Поиск кандидатов по имени, email или навыкам во всей базе организации. Можно фильтровать по статусу воронки.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Поисковый запрос (имя, email)' },
        status: { type: 'string', description: 'Статус (invited, testing, evaluated, interview, offer, hired, rejected)', enum: ['invited', 'testing', 'evaluated', 'interview', 'offer', 'hired', 'rejected'] }
      }
    }
  },
  {
    name: 'get_candidate_details',
    description: 'Получение глубокой информации о кандидате: профиль, навыки, результаты всех 6 психометрических тестов и протоколы интервью.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID кандидата' }
      },
      required: ['id']
    }
  },
  {
    name: 'get_vacancy_details',
    description: 'Получение подробных требований, описания и идеального психометрического профиля вакансии.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID вакансии' }
      },
      required: ['id']
    }
  },
  {
    name: 'list_vacancies',
    description: 'Получение списка вакансий организации с фильтрацией по статусу.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Статус (active, closed, archived, all)', default: 'active' }
      }
    }
  },
  {
    name: 'get_org_stats',
    description: 'Получение актуальной статистики воронки найма организации и текущего баланса токенов.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
]

async function getAIConfig(
  supabaseClient: SupabaseClient,
  operation_type: string
): Promise<AIConfig> {
  const { data: modelData, error: modelError } = await supabaseClient
    .from('ai_models')
    .select('*')
    .eq('operation_type', operation_type)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (modelError) throw new Error(`Failed to fetch AI model config: ${modelError.message}`)
  if (!modelData) throw new Error(`No active AI model found for ${operation_type}`)
  
  const { data: promptData, error: promptError } = await supabaseClient
    .from('ai_prompts')
    .select('prompt_text')
    .eq('operation_type', operation_type)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (promptError) throw new Error(`Failed to fetch AI prompt: ${promptError.message}`)
  if (!promptData) throw new Error(`No active AI prompt found for ${operation_type}`)

  return {
    prompt_text: promptData.prompt_text,
    provider: modelData.provider,
    model_name: modelData.model_name,
    max_output_tokens: modelData.max_output_tokens,
    temperature: modelData.temperature,
    thinking_budget: modelData.thinking_budget ?? undefined,
  }
}

function formatPrompt(config: AIConfig, context: ContextData, userMessage: string, language: string, attachmentText?: string): string {
  const org = context.org || {}
  const fStats = context.funnel_stats || {}
  
  let prompt = config.prompt_text
    .replace(/{organization_name}/g, String(org.name || 'HRb2b Client'))
    .replace(/{culture_description}/g, String(org.culture_description || 'Не указана'))
    .replace(/{token_balance}/g, String(org.token_balance || 0))
    .replace('{funnel_stats}', JSON.stringify(fStats, null, 2))
    .replace('{user_language}', language)
    .replace('{conversation_history}', '')
    .replace('{user_message}', userMessage)

  // Remove legacy placeholders if they exist
  prompt = prompt.replace('{vacancies_summary}', 'Используй инструмент list_vacancies для получения списка')
  prompt = prompt.replace('{candidates_summary}', 'Используй инструмент search_candidates для поиска')

  if (attachmentText) {
    prompt += `\n\nТЕКСТ ПРИКРЕПЛЕННОГО ФАЙЛА:\n${attachmentText}\n`
  }

  if (context.focused_entity) {
    const fe = context.focused_entity
    prompt += `\n\nТЕКУЩИЙ КОНТЕКСТ (ФОКУС НА ${String(fe.type).toUpperCase()} ID: ${fe.id}):\n`
    prompt += `Данные: ${JSON.stringify(fe.data, null, 2)}\n`
    
    if (fe.type === 'candidate') {
      if (fe.test_results && fe.test_results.length > 0) {
        prompt += `\nРЕЗУЛЬТАТЫ ТЕСТОВ КАНДИДАТА:\n${JSON.stringify(fe.test_results, null, 2)}\n`
      }
      if (fe.interviews && fe.interviews.length > 0) {
        prompt += `\nИСТОРИЯ ИНТЕРВЬЮ КАНДИДАТА:\n${JSON.stringify(fe.interviews, null, 2)}\n`
      }
    }
  }

  prompt += `\n\nВАЖНО: У тебя есть доступ к инструментам для поиска кандидатов и вакансий. Не галлюцинируй данные, если их нет в контексте — используй поиск.`

  return prompt
}

async function handleToolCall(
  supabase: SupabaseClient,
  organization_id: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  console.log(`Tool call: ${toolName}`, args)
  
  let result;
  switch (toolName) {
    case 'search_candidates': {
      const { data, error } = await supabase.rpc('search_candidates_v2', {
        p_organization_id: organization_id,
        p_query: (args.query as string) || null,
        p_status: (args.status as string) || null
      })
      if (error) throw error;
      result = data;
      break;
    }
      
    case 'get_candidate_details': {
      const { data, error } = await supabase.rpc('get_candidate_details_v2', {
        p_organization_id: organization_id,
        p_candidate_id: args.id as string
      })
      if (error) throw error;
      result = data;
      break;
    }
      
    case 'get_vacancy_details': {
      const { data, error } = await supabase.rpc('get_vacancy_details_v2', {
        p_organization_id: organization_id,
        p_vacancy_id: args.id as string
      })
      if (error) throw error;
      result = data;
      break;
    }
      
    case 'list_vacancies': {
      const { data, error } = await supabase.rpc('list_vacancies_v2', {
        p_organization_id: organization_id,
        p_status: (args.status as string) || 'active'
      })
      if (error) throw error;
      result = data;
      break;
    }
      
    case 'get_org_stats': {
      const { data, error } = await supabase.rpc('get_organization_stats_v2', {
        p_organization_id: organization_id
      })
      if (error) throw error;
      result = data;
      break;
    }
      
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }

  console.log(`Tool result (${toolName}):`, result)
  return result;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      organization_id,
      hr_specialist_id,
      conversation_id,
      message,
      history = [],
      context_type = 'global',
      context_entity_id,
      language = 'ru',
      attachment_url,
      attachment_name,
      attachment_type
    } = await req.json()

    if (!organization_id || !hr_specialist_id || (!message && !attachment_url)) {
      throw new Error('Missing required fields (organization_id, hr_specialist_id, and either message or attachment_url are required)')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseAdmin = createClient(
      // @ts-expect-error: Deno
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error: Deno
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const supabaseUser = createClient(
      // @ts-expect-error: Deno
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error: Deno
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    const { data: context, error: contextError } = await supabaseUser.rpc('get_ai_assistant_context', {
      p_organization_id: organization_id,
      p_context_type: context_type,
      p_context_entity_id: context_entity_id || null
    })

    if (contextError) {
      throw new Error(`Failed to gather context: ${contextError.message}`)
    }

    const config = await getAIConfig(supabaseAdmin, OPERATION_TYPE)
    
    let attachmentText = ''
    let attachmentBase64 = ''
    let attachmentMimeType = ''

    if (attachment_url) {
      try {
        const fileResp = await fetch(attachment_url)
        if (fileResp.ok) {
          const contentType = fileResp.headers.get('content-type') || ''
          attachmentMimeType = contentType

          if (contentType.includes('pdf')) {
            const pdfBuffer = await fileResp.arrayBuffer()
            const { text } = await extractText(pdfBuffer)
            attachmentText = text
          } else if (contentType.includes('image/')) {
            const imageBuffer = await fileResp.arrayBuffer()
            const uint8Array = new Uint8Array(imageBuffer)
            let binary = ''
            for (let i = 0; i < uint8Array.byteLength; i++) {
              binary += String.fromCharCode(uint8Array[i])
            }
            attachmentBase64 = btoa(binary)
          } else if (contentType.includes('text') || contentType.includes('json')) {
            attachmentText = await fileResp.text()
          }
        }
      } catch (err) {
        console.error('Failed to process attachment:', err)
      }
    }

    const fullPrompt = formatPrompt(config, context, message, language, attachmentText)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        let inputTokensTotal = 0
        let outputTokensTotal = 0

        try {
          if (config.provider === 'anthropic') {
            // @ts-expect-error: Deno
            const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
            const anthropic = new Anthropic({ apiKey })
            
            const anthropicMessages = [
              ...history.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
              {
                role: 'user',
                content: attachmentBase64 ? [
                  { type: 'text', text: message || 'Анализируй это изображение' },
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: attachmentMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                      data: attachmentBase64,
                    },
                  },
                ] : message
              }
            ]

            // Loop for tool calls
            let keepGoing = true
            while (keepGoing) {
              const anthropicStream = await anthropic.messages.create({
                model: config.model_name,
                max_tokens: config.max_output_tokens,
                temperature: config.temperature,
                system: fullPrompt,
                tools: TOOLS.map(t => ({
                  name: t.name,
                  description: t.description,
                  input_schema: t.parameters
                })),
                messages: anthropicMessages as Anthropic.Messages.MessageParam[],
                stream: true,
              })

              const currentToolCalls: Anthropic.Messages.ToolUseBlock[] = []
              let currentTextContent = ''

              for await (const chunk of anthropicStream) {
                if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
                  currentToolCalls.push(chunk.content_block as Anthropic.Messages.ToolUseBlock)
                } else if (chunk.type === 'content_block_delta') {
                  if (chunk.delta.type === 'text_delta') {
                    const text = chunk.delta.text
                    currentTextContent += text
                    fullResponse += text
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                  } else if (chunk.delta.type === 'input_json_delta') {
                    // Accumulate JSON for tool call
                    const lastCall = currentToolCalls[currentToolCalls.length - 1]
                    if (lastCall) {
                      lastCall.input = (lastCall.input || '') + chunk.delta.partial_json
                    }
                  }
                } else if (chunk.type === 'message_start') {
                  inputTokensTotal += chunk.message.usage.input_tokens
                } else if (chunk.type === 'message_delta') {
                  outputTokensTotal += chunk.usage.output_tokens
                }
              }

              if (currentToolCalls.length > 0) {
                // Parse accumulated JSON inputs
                const formattedToolCalls = currentToolCalls.map(tc => ({
                  ...tc,
                  input: JSON.parse(tc.input as string)
                }))

                // Add assistant's tool use to history
                const assistantContent: Anthropic.Messages.ContentBlock[] = []
                if (currentTextContent) assistantContent.push({ type: 'text', text: currentTextContent })
                formattedToolCalls.forEach(tc => assistantContent.push(tc as Anthropic.Messages.ToolUseBlock))
                anthropicMessages.push({ role: 'assistant', content: assistantContent })

                const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []
                for (const tc of formattedToolCalls) {
                  const result = await handleToolCall(supabaseUser, organization_id, tc.name, tc.input as Record<string, unknown>)
                  toolResults.push({
                    type: 'tool_result',
                    tool_use_id: tc.id,
                    content: JSON.stringify(result)
                  })
                }
                // Add tool results to history
                anthropicMessages.push({ role: 'user', content: toolResults } as unknown as Anthropic.Messages.MessageParam)
              } else {
                keepGoing = false
              }
            }
          } else if (config.provider === 'google') {
            // @ts-expect-error: Deno
            const apiKey = Deno.env.get('GEMINI_API_KEY')
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model_name}:generateContent?key=${apiKey}`
            
            const geminiContents = [
              { role: 'user', parts: [{ text: "System context: " + fullPrompt }] },
              ...history.map((m: { role: string; content: string }) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
              })),
              {
                role: 'user',
                parts: attachmentBase64 ? [
                  { text: message || 'Анализируй это изображение' },
                  {
                    inlineData: {
                      mimeType: attachmentMimeType,
                      data: attachmentBase64
                    }
                  }
                ] : [{ text: message }]
              }
            ]

            let keepGoing = true
            while (keepGoing) {
              const response = await fetch(url.replace(':generateContent', ':streamGenerateContent') + '&alt=sse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: geminiContents,
                  tools: [{ functionDeclarations: TOOLS }],
                  generationConfig: {
                    temperature: config.temperature,
                    maxOutputTokens: config.max_output_tokens,
                  }
                })
              })

              const reader = response.body?.getReader()
              if (!reader) throw new Error('Failed to open Gemini stream')

              const currentToolCalls: Array<{ functionCall?: { name: string; args: Record<string, unknown> }; text?: string }> = []
              let currentTextContent = ''

              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                const chunk = new TextDecoder().decode(value)
                const lines = chunk.split('\n')
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6))
                      const part = data.candidates[0].content.parts[0]
                      
                      if (part.text) {
                        const text = part.text
                        currentTextContent += text
                        fullResponse += text
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                      } else if (part.functionCall) {
                        currentToolCalls.push(part)
                      }
                    } catch { /* chunk fragment */ }
                  }
                }
              }

              if (currentToolCalls.length > 0) {
                // Add model's tool calls to history
                const modelParts: unknown[] = []
                if (currentTextContent) modelParts.push({ text: currentTextContent })
                currentToolCalls.forEach(tc => modelParts.push(tc))
                geminiContents.push({ role: 'model', parts: modelParts })

                const toolResults: unknown[] = []
                for (const tc of currentToolCalls) {
                  if (tc.functionCall) {
                    const result = await handleToolCall(supabaseUser, organization_id, tc.functionCall.name, tc.functionCall.args)
                    toolResults.push({
                      functionResponse: {
                        name: tc.functionCall.name,
                        response: { content: result }
                      }
                    })
                  }
                }
                // Add tool results to history
                geminiContents.push({ role: 'user', parts: toolResults })
              } else {
                keepGoing = false
              }
            }
            
            inputTokensTotal = Math.ceil(fullPrompt.length / 4) // Simplified
            outputTokensTotal = Math.ceil(fullResponse.length / 4)
          }

          await supabaseAdmin.rpc('deduct_tokens', {
            org_id: organization_id,
            amount: inputTokensTotal + outputTokensTotal,
          })

          await supabaseAdmin.from('ai_operations_log').insert({
            organization_id,
            hr_specialist_id,
            operation_type: OPERATION_TYPE,
            model_used: config.model_name,
            input_tokens: inputTokensTotal,
            output_tokens: outputTokensTotal,
            total_tokens: inputTokensTotal + outputTokensTotal,
            success: true,
            metadata: { conversation_id, context_type }
          })

          if (conversation_id) {
            await supabaseAdmin.from('ai_assistant_messages').insert([
              {
                conversation_id,
                role: 'user',
                content: message || '',
                attachment_url: attachment_url || null,
                attachment_name: attachment_name || null,
                attachment_type: attachment_type || null
              },
              { 
                conversation_id, 
                role: 'assistant', 
                content: fullResponse, 
                tokens_used: inputTokensTotal + outputTokensTotal 
              }
            ])
          }

          // Final notification via Realtime Broadcast to ensure UI updates balance
          const balanceChannel = supabaseAdmin.channel(`org-balance-${organization_id}`)
          await balanceChannel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
              await balanceChannel.send({
                type: 'broadcast',
                event: 'balance_updated',
                payload: { organization_id, total_tokens: inputTokensTotal + outputTokensTotal }
              })
              supabaseAdmin.removeChannel(balanceChannel)
            }
          })

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})