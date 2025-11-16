// @ts-expect-error deno-types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error deno-types
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error deno-types
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.20.1'

// --- SHARED LOGIC (from analyze-resumes) ---

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
  prompt_version: string
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
    .select('prompt_text, version')
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
    prompt_version: promptData.version,
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
  }
  // Simplified, as only Anthropic is used in this project based on logs
  throw new Error(`Unsupported AI provider: ${config.provider}`)
}

async function deductTokens(
  supabaseClient: SupabaseClient,
  organization_id: string,
  tokensToDeduct: number
) {
  const { error } = await supabaseClient.rpc('deduct_tokens', {
    p_organization_id: organization_id,
    p_tokens_to_deduct: tokensToDeduct,
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
  prompt_version: string
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

interface GenerateStructuredInterviewPayload {
  candidate_id: string
  vacancy_id: string
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}

const OPERATION_TYPE = 'structured_interview'

serve(async (req: Request) => {
  console.log(`[${OPERATION_TYPE}] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log(`[${OPERATION_TYPE}] Handling OPTIONS request.`);
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: GenerateStructuredInterviewPayload | null = null
  let supabaseAdmin: SupabaseClient | null = null
  let aiConfig: AIConfig | null = null

  try {
    console.log(`[${OPERATION_TYPE}] Step 1: Parsing request payload.`);
    payload = await req.json()
    console.log(`[${OPERATION_TYPE}] Step 1 successful. Payload received for candidate: ${payload?.candidate_id}`);

    if (!payload || !payload.candidate_id || !payload.vacancy_id || !payload.organization_id || !payload.hr_specialist_id) {
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

    console.log(`[${OPERATION_TYPE}] Step 4: Fetching context data (analysis, vacancy, candidate).`);
    const { data: analysisData, error: analysisError } = await supabaseAdmin
      .from('candidate_full_analysis')
      .select('content_markdown')
      .eq('candidate_id', payload.candidate_id)
      .eq('organization_id', payload.organization_id)
      .single()
    if (analysisError) throw new Error(`Failed to fetch full analysis: ${analysisError.message}`)
    if (!analysisData) throw new Error(`No full analysis found for candidate ${payload.candidate_id}`)

    const { data: vacancyData, error: vacancyError } = await supabaseAdmin
      .from('vacancies')
      .select('title')
      .eq('id', payload.vacancy_id)
      .single()
    if (vacancyError) throw new Error(`Failed to fetch vacancy: ${vacancyError.message}`)
    if (!vacancyData) throw new Error(`No vacancy found for id ${payload.vacancy_id}`)

    const { data: candidateData, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('full_name')
      .eq('id', payload.candidate_id)
      .single()
    if (candidateError) throw new Error(`Failed to fetch candidate: ${candidateError.message}`)
    if (!candidateData) throw new Error(`No candidate found for id ${payload.candidate_id}`)
    console.log(`[${OPERATION_TYPE}] Step 4 successful.`);

    console.log(`[${OPERATION_TYPE}] Step 5: Fetching AI configuration.`);
    aiConfig = await getAIConfig(supabaseAdmin, OPERATION_TYPE)
    console.log(`[${OPERATION_TYPE}] Step 5 successful. Using provider: ${aiConfig.provider}, model: ${aiConfig.model_name}`);

    console.log(`[${OPERATION_TYPE}] Step 6: Building final prompt.`);
    const finalPrompt = aiConfig.prompt_text
      .replace('{candidate_name}', candidateData.full_name)
      .replace('{vacancy_title}', vacancyData.title)
      .replace('{full_analysis_content}', analysisData.content_markdown)
      .replace('{test_results_summary}', 'Candidate has completed all psychometric tests. Key insights are included in the full analysis.')
      .replace('{language}', payload.language)
    console.log(`[${OPERATION_TYPE}] Step 6 successful.`);

    console.log(`[${OPERATION_TYPE}] Step 7: Calling AI API.`);
    const { response: aiResponse, inputTokens, outputTokens } = await callAI(aiConfig, finalPrompt)
    console.log(`[${OPERATION_TYPE}] Step 7 successful. Received response from AI.`);

    console.log(`[${OPERATION_TYPE}] Step 8: Saving result to database.`);
    const { data: savedDocument, error: insertError } = await supabaseAdmin
      .from('generated_documents')
      .insert({
        organization_id: payload.organization_id,
        candidate_id: payload.candidate_id,
        vacancy_id: payload.vacancy_id,
        created_by_hr_id: payload.hr_specialist_id,
        document_type: 'structured_interview',
        title: `Structured Interview Plan for ${candidateData.full_name}`,
        content_markdown: aiResponse,
      })
      .select()
      .single()

    if (insertError) throw new Error(`Failed to save generated document: ${insertError.message}`)
    console.log(`[${OPERATION_TYPE}] Step 8 successful. Result saved with ID: ${savedDocument.id}`);

    console.log(`[${OPERATION_TYPE}] Step 9: Deducting tokens and logging operation.`);
    await deductTokens(supabaseAdmin, payload.organization_id, inputTokens + outputTokens)
    await logAIOperation(supabaseAdmin, {
      organization_id: payload.organization_id,
      hr_specialist_id: payload.hr_specialist_id,
      operation_type: OPERATION_TYPE,
      model_used: aiConfig.model_name,
      prompt_version: aiConfig.prompt_version,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      success: true,
      metadata: {
        candidate_id: payload.candidate_id,
        vacancy_id: payload.vacancy_id,
        document_id: savedDocument.id,
      },
    })
    console.log(`[${OPERATION_TYPE}] Step 9 successful.`);

    console.log(`[${OPERATION_TYPE}] Function finished successfully.`);
    return new Response(JSON.stringify({ success: true, data: savedDocument }), {
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
        prompt_version: aiConfig?.prompt_version ?? 'N/A',
        input_tokens: 0,
        output_tokens: 0,
        success: false,
        error_message: (error as Error).message,
        metadata: {
          candidate_id: payload.candidate_id,
          vacancy_id: payload.vacancy_id,
        },
      })
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
