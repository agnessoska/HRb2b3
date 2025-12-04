// @ts-expect-error deno-types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error deno-types
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error deno-types
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.20.1'
// @ts-expect-error deno-types
import { marked } from 'https://esm.sh/marked@12.0.2'
// @ts-expect-error deno-types
import { extractText } from 'https://esm.sh/unpdf@0.11.0'

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

interface AnalyzeResumesPayload {
  organization_id: string
  hr_specialist_id: string
  vacancy_ids: string[]
  file_paths: string[]
  additional_notes?: string
  language: 'ru' | 'kk' | 'en'
  save_to_db?: boolean
}

const OPERATION_TYPE = 'resume_analysis'

serve(async (req: Request) => {
  console.log(`[${OPERATION_TYPE}] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log(`[${OPERATION_TYPE}] Handling OPTIONS request.`);
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: AnalyzeResumesPayload | null = null
  let supabaseAdmin: SupabaseClient | null = null
  let aiConfig: AIConfig | null = null

  try {
    console.log(`[${OPERATION_TYPE}] Step 1: Parsing request payload.`);
    payload = await req.json()
    console.log(`[${OPERATION_TYPE}] Step 1 successful. Payload received for ${payload?.file_paths?.length} resumes.`);

    if (!payload || !payload.vacancy_ids || !payload.file_paths || !payload.organization_id || !payload.hr_specialist_id) {
      throw new Error('Missing required fields in payload')
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

    console.log(`[${OPERATION_TYPE}] Step 4: Fetching vacancy and organization details.`);
    const { data: vacancies, error: vacanciesError } = await supabaseAdmin
      .from('vacancies')
      .select('title, description, requirements, salary_min, salary_max, currency')
      .in('id', payload.vacancy_ids)

    if (vacanciesError) throw new Error(`Failed to fetch vacancies: ${vacanciesError.message}`)
    if (!vacancies || vacancies.length === 0) throw new Error('No vacancies found for the given IDs')
    
    const { data: organization, error: orgError } = await supabaseAdmin
        .from('organizations')
        .select('culture_description')
        .eq('id', payload.organization_id)
        .single()

    if (orgError) throw new Error(`Failed to fetch organization culture: ${orgError.message}`)
    
    console.log(`[${OPERATION_TYPE}] Step 4 successful. Fetched details for ${vacancies.length} vacancies and organization culture.`);

    const vacanciesDescription = vacancies
      .map((v: { title: string; description: string | null; requirements: string | null; salary_min: number | null; salary_max: number | null; currency: string }) => {
        let salaryInfo = 'Salary: Not specified';
        if (v.salary_min || v.salary_max) {
            salaryInfo = `Salary: ${v.salary_min || 0} - ${v.salary_max || 'unlimited'} ${v.currency}`;
        }
        return `--- VACANCY: ${v.title} ---\n${salaryInfo}\nDescription: ${v.description || 'Нет описания.'}\nRequirements: ${v.requirements || 'Нет требований.'}\n---`;
      })
      .join('\n\n')

    console.log(`[${OPERATION_TYPE}] Step 5: Downloading and parsing resumes from storage.`);
    const resumesContent = await Promise.all(
      payload.file_paths.map(async (filePath) => {
        const { data, error } = await supabaseAdmin!.storage
          .from('resumes')
          .download(filePath)

        if (error) throw new Error(`Failed to download file ${filePath}: ${error.message}`)
        
        const arrayBuffer = await data.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const { text } = await extractText(uint8Array)
        const filename = filePath.split('/').pop()
        
        return `--- RESUME: ${filename} ---\n${text}\n---`
      })
    )
    const resumesText = resumesContent.join('\n\n')
    console.log(`[${OPERATION_TYPE}] Step 5 successful. Parsed ${payload.file_paths.length} resumes.`);

    console.log(`[${OPERATION_TYPE}] Step 6: Fetching AI configuration.`);
    aiConfig = await getAIConfig(supabaseAdmin, OPERATION_TYPE)
    console.log(`[${OPERATION_TYPE}] Step 6 successful. Using provider: ${aiConfig.provider}, model: ${aiConfig.model_name}`);

    console.log(`[${OPERATION_TYPE}] Step 7: Building final prompt.`);
    const finalPrompt = aiConfig.prompt_text
      .replace('{vacancies_description}', vacanciesDescription)
      .replace('{culture_description}', organization?.culture_description || 'Not specified.')
      .replace('{resumes_content}', resumesText)
      .replace('{additional_notes}', payload.additional_notes || 'Нет.')
      .replace('{language}', payload.language)
    console.log(`[${OPERATION_TYPE}] Step 7 successful.`);

    console.log(`[${OPERATION_TYPE}] Step 8: Calling AI API.`);
    const { response: aiResponse, inputTokens, outputTokens } = await callAI(aiConfig, finalPrompt)
    console.log(`[${OPERATION_TYPE}] Step 8 successful. Received response from AI.`);

    console.log(`[${OPERATION_TYPE}] Step 9: Parsing JSON response.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let analysisData: any = null;
    let htmlContent = '';
    
    try {
      // Пытаемся найти JSON блок, если он обернут в markdown
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      
      analysisData = JSON.parse(jsonString);
      
      // Генерируем простой HTML для обратной совместимости (если нужно)
      // Но основным источником истины теперь будет analysisData
      htmlContent = await marked.parse(aiResponse); // Сохраняем оригинальный ответ как есть для истории
    } catch (e) {
      console.warn(`[${OPERATION_TYPE}] Failed to parse JSON from AI response. Fallback to raw text.`, e);
      // Если не удалось распарсить JSON, сохраняем как есть, analysisData останется null
      htmlContent = await marked.parse(aiResponse);
    }
    console.log(`[${OPERATION_TYPE}] Step 9 successful.`);

    let savedResult = null;
    const shouldSave = payload.save_to_db !== false; // Default to true

    if (shouldSave) {
        console.log(`[${OPERATION_TYPE}] Step 10: Saving result to database.`);
        const { data, error: insertError } = await supabaseAdmin
          .from('resume_analysis_results')
          .insert({
            organization_id: payload.organization_id,
            created_by_hr_id: payload.hr_specialist_id,
            vacancy_ids: payload.vacancy_ids,
            resume_count: payload.file_paths.length,
            content_markdown: aiResponse,
            content_html: htmlContent,
            analysis_data: analysisData,
            file_paths: payload.file_paths
          })
          .select()
          .single()

        if (insertError) throw new Error(`Failed to save resume analysis results: ${insertError.message}`)
        savedResult = data;
        console.log(`[${OPERATION_TYPE}] Step 10 successful. Result saved with ID: ${savedResult.id}`);
    } else {
        console.log(`[${OPERATION_TYPE}] Step 10: Skipping database save (save_to_db=false).`);
        // Mock saved result structure for response
        savedResult = {
            id: 'temp-chunk-' + Date.now(),
            content_markdown: aiResponse,
            content_html: htmlContent,
            analysis_data: analysisData,
            created_at: new Date().toISOString()
        }
    }

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
        vacancy_ids: payload.vacancy_ids,
        resume_count: payload.file_paths.length,
        result_id: savedResult.id,
        save_skipped: !shouldSave
      },
    })
    console.log(`[${OPERATION_TYPE}] Step 11 successful.`);

    console.log(`[${OPERATION_TYPE}] Function finished successfully.`);
    
    // Return structured data even if not saved, so client can merge
    return new Response(JSON.stringify({ 
        success: true, 
        result: savedResult,
        data: { // Add explicit data object for client consumption
            content_markdown: aiResponse,
            content_html: htmlContent,
            analysis_data: analysisData
        }
    }), {
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
          vacancy_ids: payload.vacancy_ids,
          resume_count: payload.file_paths?.length ?? 0,
        },
      })
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
