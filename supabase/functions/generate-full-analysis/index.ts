// @ts-expect-error deno-types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error deno-types
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error deno-types
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.20.1'

// --- SHARED LOGIC (Copied from generate-ideal-profile) ---

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

interface GenerateFullAnalysisPayload {
  candidate_id: string
  vacancy_ids: string[]
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}

const OPERATION_TYPE = 'full_analysis'

serve(async (req: Request) => {
  console.log(`[${OPERATION_TYPE}] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: GenerateFullAnalysisPayload | null = null
  let supabaseAdmin: SupabaseClient | null = null
  let aiConfig: AIConfig | null = null

  try {
    payload = await req.json()
    if (!payload || !payload.candidate_id || !payload.organization_id || !payload.hr_specialist_id) {
      throw new Error('Missing required fields in payload')
    }

    // @ts-expect-error Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-expect-error Deno global
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables');
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch Candidate Data
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', payload.candidate_id)
      .single()
    if (candidateError) throw new Error(`Failed to fetch candidate: ${candidateError.message}`)

    // 2. Fetch Test Results
    const { data: testResults, error: resultsError } = await supabaseAdmin
      .from('candidate_test_results')
      .select('test_id, normalized_scores, detailed_result')
      .eq('candidate_id', payload.candidate_id)
    if (resultsError) throw new Error(`Failed to fetch test results: ${resultsError.message}`)

    // 3. Fetch Vacancy Data
    const { data: vacancies, error: vacanciesError } = await supabaseAdmin
      .from('vacancies')
      .select('title, description')
      .in('id', payload.vacancy_ids)
    if (vacanciesError) throw new Error(`Failed to fetch vacancies: ${vacanciesError.message}`)

    // 4. Fetch AI Config
    aiConfig = await getAIConfig(supabaseAdmin, OPERATION_TYPE)

    // 5. Build Prompt
    type TestResult = { test_id: string; normalized_scores: unknown; detailed_result: string | null }
    type Vacancy = { title: string; description: string | null }

    const testResultsText = testResults.map((r: TestResult) => `${r.test_id}: ${JSON.stringify(r.normalized_scores || r.detailed_result)}`).join('\n')
    const vacanciesText = vacancies.map((v: Vacancy) => `Title: ${v.title}\nDescription: ${v.description}`).join('\n\n')

    const finalPrompt = aiConfig.prompt_text
      .replace('{full_name}', candidate.full_name || 'N/A')
      .replace('{category}', candidate.category_id || 'N/A')
      .replace('{experience}', candidate.experience || 'N/A')
      .replace('{education}', candidate.education || 'N/A')
      .replace('{about}', candidate.about || 'N/A')
      .replace('{skills}', 'N/A') // TODO: Fetch skills
      .replace('{test_results}', testResultsText)
      .replace('{vacancies_descriptions}', vacanciesText)
      .replace('{language}', payload.language)

    // 6. Call AI
    const { response: aiResponse, inputTokens, outputTokens } = await callAI(aiConfig, finalPrompt)

    // 7. Save result
    const { data: savedAnalysis, error: insertError } = await supabaseAdmin
      .from('candidate_full_analysis')
      .insert({
        candidate_id: payload.candidate_id,
        organization_id: payload.organization_id,
        created_by_hr_id: payload.hr_specialist_id,
        vacancy_ids: payload.vacancy_ids,
        content_markdown: aiResponse,
      })
      .select()
      .single()
    if (insertError) throw new Error(`Failed to save full analysis: ${insertError.message}`)

    // 8. Deduct tokens and log
    await deductTokens(supabaseAdmin, payload.organization_id, inputTokens + outputTokens)
    await logAIOperation(supabaseAdmin, {
      organization_id: payload.organization_id,
      hr_specialist_id: payload.hr_specialist_id,
      operation_type: OPERATION_TYPE,
      model_used: aiConfig.model_name,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      success: true,
      metadata: { candidate_id: payload.candidate_id, analysis_id: savedAnalysis.id }
    })

    return new Response(JSON.stringify(savedAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    if (payload && supabaseAdmin) {
      await logAIOperation(supabaseAdmin, {
        organization_id: payload.organization_id,
        hr_specialist_id: payload.hr_specialist_id,
        operation_type: OPERATION_TYPE,
        model_used: aiConfig?.model_name ?? 'N/A',
        input_tokens: 0,
        output_tokens: 0,
        success: false,
        error_message: (error as Error).message,
        metadata: { candidate_id: payload.candidate_id }
      })
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
