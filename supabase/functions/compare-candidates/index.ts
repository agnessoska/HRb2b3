// @ts-expect-error deno-types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error deno-types
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error deno-types
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.20.1'
// @ts-expect-error deno-types
import { marked } from 'https://esm.sh/marked@12.0.2'

// --- SHARED LOGIC ---

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIConfig {
  prompt_text: string
  provider: string
  model_name: string
  max_output_tokens: number
  temperature: number
  thinking_budget?: number
}

async function getAIConfig(
  supabaseClient: SupabaseClient,
  operation_type: string
): Promise<AIConfig> {
  const { data: modelData, error: modelError } = await supabaseClient
    .from('ai_models')
    .select('*')
    .eq('operation_type', operation_type)
    .eq('is_active', true)
    .single()

  if (modelError) throw new Error(`Failed to fetch AI model config: ${modelError.message}`)
  if (!modelData) throw new Error(`No active AI model found for operation: ${operation_type}`)

  const { data: promptData, error: promptError } = await supabaseClient
    .from('ai_prompts')
    .select('prompt_text')
    .eq('operation_type', operation_type)
    .eq('is_active', true)
    .single()

  if (promptError) throw new Error(`Failed to fetch AI prompt: ${promptError.message}`)
  if (!promptData) throw new Error(`No active prompt found for operation: ${operation_type}`)

  return {
    prompt_text: promptData.prompt_text,
    provider: modelData.provider,
    model_name: modelData.model_name,
    max_output_tokens: modelData.max_output_tokens,
    temperature: modelData.temperature,
    thinking_budget: modelData.thinking_budget ?? undefined,
  }
}

async function callAI(config: AIConfig, prompt: string): Promise<{ response: string; inputTokens: number; outputTokens: number }> {
    if (config.provider === 'anthropic') {
      // @ts-expect-error Deno global
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in Supabase secrets')
      const anthropic = new Anthropic({ apiKey })
      
      const body: Anthropic.Messages.MessageCreateParams = {
          model: config.model_name,
          max_tokens: config.max_output_tokens,
          temperature: config.temperature,
          messages: [{ role: 'user', content: prompt }],
      };
  
      if (config.thinking_budget && config.thinking_budget > 0) {
          body.thinking = {
              type: 'enabled',
              budget_tokens: config.thinking_budget,
          }
      }
  
      const msg = await anthropic.messages.create(body);
      const textBlock = msg.content.find((block: { type: string; }) => block.type === 'text');
      if (!textBlock) {
        throw new Error('Anthropic API response did not contain a text block.');
      }
  
      return {
        response: textBlock.text,
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
      }
    } else if (config.provider === 'google') {
      // @ts-expect-error Deno global
      const API_KEY = Deno.env.get('GEMINI_API_KEY')
      if (!API_KEY) throw new Error('GEMINI_API_KEY is not set in Supabase secrets')
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model_name}:generateContent?key=${API_KEY}`
  
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.max_output_tokens,
          ...(config.thinking_budget && {
            thinkingConfig: {
              thinkingBudget: config.thinking_budget,
            },
          }),
        },
      }
  
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
  
      if (!res.ok) {
        const error = await res.json()
        throw new Error(`Google AI API error: ${error.error.message}`)
      }
  
      const data = await res.json()
      return {
        response: data.candidates[0].content.parts[0].text,
        inputTokens: 0,
        outputTokens: 0,
      }
    } else {
      throw new Error(`Unsupported AI provider: ${config.provider}`)
    }
  }

async function deductTokens(
  supabaseClient: SupabaseClient,
  organization_id: string,
  tokensToDeduct: number
) {
  const { error } = await supabaseClient.rpc('deduct_tokens', {
    org_id: organization_id,
    amount: tokensToDeduct,
  })
  if (error) {
    console.error(`Failed to deduct tokens for organization ${organization_id}:`, error)
  }
}

interface LogAIOperationPayload {
  organization_id: string
  hr_specialist_id: string
  operation_type: string
  model_used: string
  input_tokens: number
  output_tokens: number
  success: boolean
  error_message?: string
  metadata?: Record<string, unknown>
}

async function logAIOperation(
  supabaseClient: SupabaseClient,
  payload: LogAIOperationPayload
) {
  const { error } = await supabaseClient.from('ai_operations_log').insert({
    ...payload,
    total_tokens: payload.input_tokens + payload.output_tokens,
  })

  if (error) {
    console.error(`Failed to log AI operation for organization ${payload.organization_id}:`, error)
  }
}

// --- MAIN FUNCTION LOGIC ---

interface CompareCandidatesPayload {
  organization_id: string
  hr_specialist_id: string
  vacancy_id: string
  candidate_ids: string[] // 2-5 candidates
  language: 'ru' | 'kk' | 'en'
}

const OPERATION_TYPE = 'candidate_comparison'

serve(async (req: Request) => {
  console.log(`[${OPERATION_TYPE}] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log(`[${OPERATION_TYPE}] Handling OPTIONS request.`);
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: CompareCandidatesPayload | null = null
  let supabaseAdmin: SupabaseClient | null = null
  let aiConfig: AIConfig | null = null

  try {
    console.log(`[${OPERATION_TYPE}] Step 1: Parsing request payload.`);
    payload = await req.json()
    console.log(`[${OPERATION_TYPE}] Step 1 successful. Comparing ${payload?.candidate_ids?.length} candidates for vacancy ${payload?.vacancy_id}.`);

    if (!payload || !payload.vacancy_id || !payload.candidate_ids || !payload.organization_id || !payload.hr_specialist_id) {
      throw new Error('Missing required fields in payload')
    }
    if (payload.candidate_ids.length < 2 || payload.candidate_ids.length > 5) {
        throw new Error('Candidate comparison requires between 2 and 5 candidates.')
    }

    console.log(`[${OPERATION_TYPE}] Step 2: Checking environment variables.`);
    // @ts-expect-error Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-expect-error Deno global
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables (URL or Service Key)');
    }
    console.log(`[${OPERATION_TYPE}] Step 2 successful. Supabase env vars are present.`);

    console.log(`[${OPERATION_TYPE}] Step 3: Creating Supabase admin client.`);
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    console.log(`[${OPERATION_TYPE}] Step 3 successful. Supabase client created.`);

    console.log(`[${OPERATION_TYPE}] Step 4: Fetching vacancy details.`);
    const { data: vacancy, error: vacancyError } = await supabaseAdmin
      .from('vacancies')
      .select('title, description')
      .eq('id', payload.vacancy_id)
      .single()

    if (vacancyError) throw new Error(`Failed to fetch vacancy: ${vacancyError.message}`)
    if (!vacancy) throw new Error('Vacancy not found')
    console.log(`[${OPERATION_TYPE}] Step 4 successful. Fetched details for vacancy: ${vacancy.title}`);

    console.log(`[${OPERATION_TYPE}] Step 5: Fetching candidate analyses.`);
    const { data: analyses, error: analysesError } = await supabaseAdmin
        .from('candidate_full_analysis')
        .select('candidate_id, content_markdown')
        .in('candidate_id', payload.candidate_ids)

    if(analysesError) throw new Error(`Failed to fetch candidate analyses: ${analysesError.message}`);
    if(!analyses || analyses.length !== payload.candidate_ids.length) throw new Error('Could not find full analysis for all specified candidates.');
    
    const candidateAnalysesText = analyses.map((a: { candidate_id: string; content_markdown: string | null }, index: number) =>
        `--- CANDIDATE ${index + 1} ---\n${a.content_markdown || 'No analysis content.'}\n---`
    ).join('\n\n');
    console.log(`[${OPERATION_TYPE}] Step 5 successful. Fetched ${analyses.length} analyses.`);

    console.log(`[${OPERATION_TYPE}] Step 6: Fetching AI configuration.`);
    aiConfig = await getAIConfig(supabaseAdmin, OPERATION_TYPE)
    console.log(`[${OPERATION_TYPE}] Step 6 successful. Using provider: ${aiConfig.provider}, model: ${aiConfig.model_name}`);

    console.log(`[${OPERATION_TYPE}] Step 7: Building final prompt.`);
    const finalPrompt = aiConfig.prompt_text
      .replace('{vacancy_title}', vacancy.title)
      .replace('{vacancy_description}', vacancy.description || 'No description provided.')
      .replace('{candidates_analyses}', candidateAnalysesText)
      .replace('{language}', payload.language)
    console.log(`[${OPERATION_TYPE}] Step 7 successful.`);

    console.log(`[${OPERATION_TYPE}] Step 8: Calling AI API.`);
    const { response: aiResponse, inputTokens, outputTokens } = await callAI(aiConfig, finalPrompt)
    console.log(`[${OPERATION_TYPE}] Step 8 successful. Received response from AI.`);

    console.log(`[${OPERATION_TYPE}] Step 9: Converting markdown to HTML.`);
    const htmlContent = await marked.parse(aiResponse);
    console.log(`[${OPERATION_TYPE}] Step 9 successful.`);

    // Note: Parsing ranking from response is omitted for simplicity, as per TZ it's just saved.
    // A more robust solution would parse a JSON block from the markdown.

    console.log(`[${OPERATION_TYPE}] Step 10: Saving result to database.`);
    const { data: savedResult, error: insertError } = await supabaseAdmin
      .from('candidate_comparisons')
      .insert({
        organization_id: payload.organization_id,
        vacancy_id: payload.vacancy_id,
        created_by_hr_id: payload.hr_specialist_id,
        candidate_ids: payload.candidate_ids,
        content_markdown: aiResponse,
        content_html: htmlContent,
        // ranking: parsedRanking, // Omitted for now
      })
      .select()
      .single()

    if (insertError) throw new Error(`Failed to save candidate comparison results: ${insertError.message}`)
    console.log(`[${OPERATION_TYPE}] Step 10 successful. Result saved with ID: ${savedResult.id}`);

    console.log(`[${OPERATION_TYPE}] Step 11: Deducting tokens and logging operation.`);
    await deductTokens(supabaseAdmin, payload.organization_id, inputTokens + outputTokens)
    await logAIOperation(supabaseAdmin, {
      organization_id: payload.organization_id,
      hr_specialist_id: payload.hr_specialist_id,
      operation_type: OPERATION_TYPE,
      model_used: aiConfig.model_name,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      success: true,
      metadata: {
        vacancy_id: payload.vacancy_id,
        candidate_ids: payload.candidate_ids,
        result_id: savedResult.id,
      },
    })
    console.log(`[${OPERATION_TYPE}] Step 11 successful.`);

    console.log(`[${OPERATION_TYPE}] Function finished successfully.`);
    return new Response(JSON.stringify({ success: true, result: savedResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(`[${OPERATION_TYPE}] Error caught in main block:`, error);
    if (payload && supabaseAdmin) {
      console.log(`[${OPERATION_TYPE}] Logging failed operation.`);
      await logAIOperation(supabaseAdmin, {
        organization_id: payload.organization_id,
        hr_specialist_id: payload.hr_specialist_id,
        operation_type: OPERATION_TYPE,
        model_used: aiConfig?.model_name ?? 'N/A',
        input_tokens: 0,
        output_tokens: 0,
        success: false,
        error_message: (error as Error).message,
        metadata: {
          vacancy_id: payload.vacancy_id,
          candidate_ids: payload.candidate_ids,
        },
      })
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
