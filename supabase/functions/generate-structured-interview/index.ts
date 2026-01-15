// @ts-expect-error deno-types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error deno-types
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-expect-error deno-types
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.20.1'

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
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
    
    const anthropic = new Anthropic({ apiKey })
    
    const body: Anthropic.Messages.MessageCreateParams = {
      model: config.model_name,
      max_tokens: config.max_output_tokens,
      temperature: config.temperature,
      messages: [{ role: 'user', content: prompt }],
    }

    if (config.thinking_budget && config.thinking_budget > 0) {
      body.thinking = {
        type: "enabled",
        budget_tokens: config.thinking_budget
      }
    }

    const msg = await anthropic.messages.create(body)
    const textBlock = msg.content.find((block: { type: string }) => block.type === 'text')
    if (!textBlock) throw new Error('No text block in AI response')

    return {
      response: textBlock.text,
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    }
  } else if (config.provider === 'google') {
    // @ts-expect-error Deno global
    const API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!API_KEY) throw new Error('GEMINI_API_KEY is not set')
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
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('Google AI API returned no candidates:', data)
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Google AI API blocked the request: ${data.promptFeedback.blockReason}`)
      }
      throw new Error('Google AI API returned an empty response')
    }

    const candidate = data.candidates[0]
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'OTHER') {
      throw new Error(`AI generation stopped prematurely: ${candidate.finishReason}`)
    }

    if (!candidate.content?.parts?.[0]?.text) {
      throw new Error('Google AI API response structure is missing text parts')
    }

    return {
      response: candidate.content.parts[0].text,
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
    }
  }
  
  throw new Error(`Unsupported AI provider: ${config.provider}`)
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
    console.error('Failed to deduct tokens:', error)
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
    console.error('Failed to log AI operation:', error)
  }
}

interface TestResultWithCode {
  test_id: string
  detailed_result?: string | null
  normalized_scores?: Record<string, number> | null
  tests: { code: string } | null
}

function formatTestResults(results: TestResultWithCode[]): string {
  if (!results || results.length === 0) return "Tests not completed"

  const testsByCode: Record<string, { normalized_scores: unknown; detailed_result: string | null }> = {}
  results.forEach((tr) => {
    if (tr.tests?.code) {
      testsByCode[tr.tests.code] = {
        normalized_scores: tr.normalized_scores,
        detailed_result: tr.detailed_result ?? null
      }
    }
  })

  const bigFive = testsByCode['big_five']?.normalized_scores
    ? JSON.stringify(testsByCode['big_five'].normalized_scores, null, 2)
    : 'Нет данных'
  
  const mbti = testsByCode['mbti']?.detailed_result || 'Нет данных'
  
  const disc = testsByCode['disc']?.normalized_scores
    ? JSON.stringify(testsByCode['disc'].normalized_scores, null, 2)
    : 'Нет данных'
  
  const eq = testsByCode['eq']?.normalized_scores
    ? JSON.stringify(testsByCode['eq'].normalized_scores, null, 2)
    : 'Нет данных'
  
  const softSkills = testsByCode['soft_skills']?.normalized_scores
    ? JSON.stringify(testsByCode['soft_skills'].normalized_scores, null, 2)
    : 'Нет данных'
  
  const motivation = testsByCode['motivation']?.normalized_scores
    ? JSON.stringify(testsByCode['motivation'].normalized_scores, null, 2)
    : 'Нет данных'

  return `Big Five:\n${bigFive}\n\nMBTI: ${mbti}\n\nDISC:\n${disc}\n\nEQ:\n${eq}\n\nSoft Skills:\n${softSkills}\n\nMotivation:\n${motivation}`
}

interface GenerateStructuredInterviewPayload {
  candidate_id: string
  vacancy_id: string
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
  additional_info?: string
}

const OPERATION_TYPE = 'structured_interview'

serve(async (req: Request) => {
  console.log(`[${OPERATION_TYPE}] Function invoked`)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: GenerateStructuredInterviewPayload | null = null
  let supabaseAdmin: SupabaseClient | null = null
  let aiConfig: AIConfig | null = null

  try {
    payload = await req.json()
    console.log(`[${OPERATION_TYPE}] Payload received`)

    if (!payload || !payload.candidate_id || !payload.vacancy_id || !payload.organization_id || !payload.hr_specialist_id) {
      throw new Error('Missing required fields')
    }

    // @ts-expect-error Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-expect-error Deno global
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check for existing planned session (idempotency)
    // If a session was created in the last 5 minutes and is still 'planned', return it
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: existingSession } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('candidate_id', payload.candidate_id)
      .eq('vacancy_id', payload.vacancy_id)
      .eq('status', 'planned')
      .gt('created_at', fiveMinutesAgo)
      .maybeSingle()

    if (existingSession) {
      console.log(`[${OPERATION_TYPE}] Found existing planned session, returning it`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: existingSession 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Load candidate data
    const { data: candidateData, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select(`
        *,
        professional_categories (name_ru, name_en, name_kk)
      `)
      .eq('id', payload.candidate_id)
      .single()
    
    if (candidateError) throw new Error(`Failed to fetch candidate: ${candidateError.message}`)
    
    // Load skills
    const { data: skillsData, error: skillsError } = await supabaseAdmin
      .from('candidate_skills')
      .select('canonical_skill')
      .eq('candidate_id', payload.candidate_id)
    
    if (skillsError) throw new Error(`Failed to fetch skills: ${skillsError.message}`)
    
    // Load test results
    const { data: testResultsData, error: testResultsError } = await supabaseAdmin
      .from('candidate_test_results')
      .select(`
        test_id,
        normalized_scores,
        detailed_result,
        tests (code)
      `)
      .eq('candidate_id', payload.candidate_id)
    
    if (testResultsError) throw new Error(`Failed to fetch tests: ${testResultsError.message}`)
    if (!testResultsData || testResultsData.length < 6) {
      throw new Error('Candidate must complete all 6 tests')
    }

    // Load vacancy
    const { data: vacancyData, error: vacancyError } = await supabaseAdmin
      .from('vacancies')
      .select('title, description, requirements')
      .eq('id', payload.vacancy_id)
      .single()
    
    if (vacancyError) throw new Error(`Failed to fetch vacancy: ${vacancyError.message}`)

    // Get AI config
    aiConfig = await getAIConfig(supabaseAdmin, OPERATION_TYPE)
    console.log(`[${OPERATION_TYPE}] Using ${aiConfig.provider} ${aiConfig.model_name}`)

    // Build prompt
    const getCategoryName = () => {
      if (!candidateData.professional_categories) return 'Unknown'
      const lang = payload!.language
      return candidateData.professional_categories[`name_${lang}`] || candidateData.professional_categories.name_en
    }

    const formattedTestResults = formatTestResults(testResultsData)
    const skillsList = skillsData?.map((s: { canonical_skill: string }) => s.canonical_skill).join(', ') || 'None'

    const finalPrompt = aiConfig.prompt_text
      .replace('{candidate_name}', candidateData.full_name)
      .replace('{category}', getCategoryName())
      .replace('{experience}', candidateData.experience || 'Not specified')
      .replace('{education}', candidateData.education || 'Not specified')
      .replace('{skills}', skillsList)
      .replace('{test_results}', formattedTestResults)
      .replace('{vacancy_title}', vacancyData.title)
      .replace('{vacancy_description}', `${vacancyData.description}\n\nRequirements:\n${vacancyData.requirements}`)
      .replace('{language}', payload.language === 'kk' ? 'Kazakh' : payload.language === 'ru' ? 'Russian' : 'English')
      + (payload.additional_info ? `\n\nADDITIONAL INSTRUCTIONS:\n${payload.additional_info}` : '')

    // Call AI
    console.log(`[${OPERATION_TYPE}] Calling AI`)
    const { response: aiResponse, inputTokens, outputTokens } = await callAI(aiConfig, finalPrompt)

    // Parse JSON response with auto-fixing
    console.log(`[${OPERATION_TYPE}] Parsing AI response`)
    let interviewPlan
    try {
      let cleanedResponse = aiResponse.trim()
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/\s*```$/,' ')
      
      // Fix common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\\n/g, ' ') // Replace \n with space
        .replace(/\n/g, ' ') // Replace newlines with space in strings
      
      interviewPlan = JSON.parse(cleanedResponse)
      
      // Validate structure
      if (!interviewPlan.sections || !Array.isArray(interviewPlan.sections)) {
        throw new Error('Invalid structure: missing sections array')
      }
      if (interviewPlan.sections.length < 3) {
        throw new Error('Invalid structure: need at least 3 sections')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.log('Response length:', aiResponse.length)
      console.log('Response preview:', aiResponse.substring(0, 1000))
      throw new Error(`AI returned invalid JSON: ${(parseError as Error).message}`)
    }

    // Save to interview_sessions table
    console.log(`[${OPERATION_TYPE}] Saving to database`)
    const { data: savedSession, error: insertError } = await supabaseAdmin
      .from('interview_sessions')
      .insert({
        organization_id: payload.organization_id,
        hr_specialist_id: payload.hr_specialist_id,
        candidate_id: payload.candidate_id,
        vacancy_id: payload.vacancy_id,
        interview_plan: interviewPlan,
        session_data: {
          notes: {},
          ratings: {},
          completed_items: [],
          progress: {
            current_section: 'intro',
            sections_completed: []
          }
        },
        status: 'planned',
        language: payload.language,
        version: 'v3'
      })
      .select()
      .single()

    if (insertError) throw new Error(`Failed to save session: ${insertError.message}`)

    // Deduct tokens and log
    console.log(`[${OPERATION_TYPE}] Logging operation`)
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
        session_id: savedSession.id,
      },
    })

    console.log(`[${OPERATION_TYPE}] Success`)
    return new Response(
      JSON.stringify({
        success: true,
        data: savedSession,
        total_tokens: inputTokens + outputTokens
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error(`[${OPERATION_TYPE}] Error:`, error)
    
    if (payload && supabaseAdmin && aiConfig) {
      await logAIOperation(supabaseAdmin, {
        organization_id: payload.organization_id,
        hr_specialist_id: payload.hr_specialist_id,
        operation_type: OPERATION_TYPE,
        model_used: aiConfig.model_name,
        prompt_version: aiConfig.prompt_version,
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
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
