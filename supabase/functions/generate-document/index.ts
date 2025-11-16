// @ts-expect-error deno-types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error deno-types
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error deno-types
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.20.1'

// --- SHARED LOGIC (Mirrored from analyze-resumes) ---

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

interface GenerateDocumentPayload {
  candidate_id: string
  vacancy_id?: string
  organization_id: string
  hr_specialist_id: string
  document_type: 'interview_invitation' | 'job_offer' | 'rejection_letter'
  additional_info: string
  language: 'ru' | 'kk' | 'en'
}

serve(async (req: Request) => {
  const operation_type = 'generate-document'
  console.log(`[${operation_type}] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log(`[${operation_type}] Handling OPTIONS request.`);
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: GenerateDocumentPayload | null = null
  let supabaseAdmin: SupabaseClient | null = null
  let aiConfig: AIConfig | null = null

  try {
    console.log(`[${operation_type}] Step 1: Parsing request payload.`);
    payload = await req.json()
    
    if (!payload || !payload.candidate_id || !payload.organization_id || !payload.hr_specialist_id || !payload.document_type) {
      throw new Error('Missing required fields in payload')
    }
    const { document_type } = payload
    console.log(`[${operation_type}] Step 1 successful. Payload for document type "${document_type}" received.`);

    console.log(`[${operation_type}] Step 2: Creating Supabase admin client.`);
    // @ts-expect-error Deno global
    supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    console.log(`[${operation_type}] Step 2 successful.`);

    console.log(`[${operation_type}] Step 3: Gathering context data (candidate, vacancy, org).`);
    const { data: candidateData, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('full_name')
      .eq('id', payload.candidate_id)
      .single()
    if (candidateError) throw new Error(`Candidate not found: ${candidateError.message}`)

    let vacancyTitle = 'N/A'
    if (payload.vacancy_id) {
      const { data: vacancyData, error: vacancyError } = await supabaseAdmin
        .from('vacancies')
        .select('title')
        .eq('id', payload.vacancy_id)
        .single()
      if (vacancyError) console.warn(`Vacancy not found: ${vacancyError.message}`)
      else vacancyTitle = vacancyData.title
    }
    
    const { data: orgData, error: orgError } = await supabaseAdmin
        .from('organizations')
        .select('name')
        .eq('id', payload.organization_id)
        .single()
    if (orgError) throw new Error(`Organization not found: ${orgError.message}`)
    console.log(`[${operation_type}] Step 3 successful.`);

    console.log(`[${operation_type}] Step 4: Fetching AI configuration for "${document_type}".`);
    aiConfig = await getAIConfig(supabaseAdmin, document_type)
    console.log(`[${operation_type}] Step 4 successful. Using provider: ${aiConfig.provider}, model: ${aiConfig.model_name}`);

    console.log(`[${operation_type}] Step 5: Building final prompt.`);
    const finalPrompt = aiConfig.prompt_text
      .replace('{candidate_name}', candidateData.full_name)
      .replace('{vacancy_title}', vacancyTitle)
      .replace('{organization_name}', orgData.name)
      .replace('{additional_info}', payload.additional_info || 'Нет.')
      .replace('{language}', payload.language)
    console.log(`[${operation_type}] Step 5 successful.`);

    console.log(`[${operation_type}] Step 6: Calling AI API.`);
    const { response: contentMarkdown, inputTokens, outputTokens } = await callAI(aiConfig, finalPrompt)
    console.log(`[${operation_type}] Step 6 successful. Received response from AI.`);

    console.log(`[${operation_type}] Step 7: Saving result to database.`);
    const { data: savedDocument, error: saveError } = await supabaseAdmin
      .from('generated_documents')
      .insert({
        organization_id: payload.organization_id,
        candidate_id: payload.candidate_id,
        vacancy_id: payload.vacancy_id,
        created_by_hr_id: payload.hr_specialist_id,
        document_type: payload.document_type,
        title: `${payload.document_type} for ${candidateData.full_name}`,
        content_markdown: contentMarkdown,
      })
      .select()
      .single()
    if (saveError) throw new Error(`Failed to save document: ${saveError.message}`)
    console.log(`[${operation_type}] Step 7 successful. Document saved with ID: ${savedDocument.id}`);

    console.log(`[${operation_type}] Step 8: Deducting tokens and logging operation.`);
    await deductTokens(supabaseAdmin, payload.organization_id, inputTokens + outputTokens)
    await logAIOperation(supabaseAdmin, {
      organization_id: payload.organization_id,
      hr_specialist_id: payload.hr_specialist_id,
      operation_type: document_type,
      model_used: aiConfig.model_name,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      success: true,
      metadata: { candidate_id: payload.candidate_id, vacancy_id: payload.vacancy_id, document_id: savedDocument.id },
    })
    console.log(`[${operation_type}] Step 8 successful.`);

    console.log(`[${operation_type}] Function finished successfully.`);
    return new Response(JSON.stringify({ success: true, data: savedDocument }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(`[${operation_type}] Error caught in main block:`, error);
    if (payload && supabaseAdmin) {
      console.log(`[${operation_type}] Logging failed operation.`);
      await logAIOperation(supabaseAdmin, {
        organization_id: payload.organization_id,
        hr_specialist_id: payload.hr_specialist_id,
        operation_type: payload.document_type || 'unknown_document',
        model_used: aiConfig?.model_name ?? 'N/A',
        input_tokens: 0,
        output_tokens: 0,
        success: false,
        error_message: (error as Error).message,
        metadata: { candidate_id: payload.candidate_id, vacancy_id: payload.vacancy_id },
      })
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
