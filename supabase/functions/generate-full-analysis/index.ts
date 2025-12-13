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
    console.log(`[${OPERATION_TYPE}] Handling OPTIONS request.`);
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: GenerateFullAnalysisPayload | null = null
  let supabaseAdmin: SupabaseClient | null = null
  let aiConfig: AIConfig | null = null

  try {
    console.log(`[${OPERATION_TYPE}] Step 1: Parsing request payload.`);
    payload = await req.json()
    console.log(`[${OPERATION_TYPE}] Step 1 successful. Analyzing candidate ${payload?.candidate_id}.`);

    if (!payload || !payload.candidate_id || !payload.organization_id || !payload.hr_specialist_id) {
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

    console.log(`[${OPERATION_TYPE}] Step 4: Fetching candidate profile with category.`);
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select(`
        id,
        full_name,
        email,
        phone,
        experience,
        education,
        about,
        tests_completed,
        professional_categories (name_ru, name_en, name_kk)
      `)
      .eq('id', payload.candidate_id)
      .single()

    if (candidateError) throw new Error(`Failed to fetch candidate: ${candidateError.message}`)
    if (!candidate) throw new Error('Candidate not found')
    if (candidate.tests_completed < 6) throw new Error('Candidate has not completed all 6 tests')
    console.log(`[${OPERATION_TYPE}] Step 4 successful. Fetched candidate: ${candidate.full_name}`);

    console.log(`[${OPERATION_TYPE}] Step 5: Fetching candidate skills.`);
    const { data: skills, error: skillsError } = await supabaseAdmin
      .from('candidate_skills')
      .select('canonical_skill')
      .eq('candidate_id', payload.candidate_id)

    if (skillsError) throw new Error(`Failed to fetch skills: ${skillsError.message}`)
    const skillsList = skills?.map((s: { canonical_skill: string }) => s.canonical_skill) || []
    console.log(`[${OPERATION_TYPE}] Step 5 successful. Fetched ${skillsList.length} skills.`);

    console.log(`[${OPERATION_TYPE}] Step 6: Fetching all test results.`);
    const { data: testResults, error: testsError } = await supabaseAdmin
      .from('candidate_test_results')
      .select(`
        test_id,
        normalized_scores,
        detailed_result,
        tests (code, name_ru, name_en, name_kk)
      `)
      .eq('candidate_id', payload.candidate_id)

    if (testsError) throw new Error(`Failed to fetch test results: ${testsError.message}`)
    if (!testResults || testResults.length < 6) throw new Error('Not all test results found')
    console.log(`[${OPERATION_TYPE}] Step 6 successful. Fetched ${testResults.length} test results.`);

    console.log(`[${OPERATION_TYPE}] Step 7: Fetching vacancies.`);
    const { data: vacancies, error: vacanciesError } = await supabaseAdmin
      .from('vacancies')
      .select('title, description, requirements, salary_min, salary_max, currency, employment_type, ideal_profile')
      .in('id', payload.vacancy_ids)

    if (vacanciesError) throw new Error(`Failed to fetch vacancies: ${vacanciesError.message}`)
    console.log(`[${OPERATION_TYPE}] Step 7 successful. Fetched ${vacancies?.length || 0} vacancies.`);

    console.log(`[${OPERATION_TYPE}] Step 8: Fetching organization culture.`);
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('culture_description')
      .eq('id', payload.organization_id)
      .single()

    if (orgError) throw new Error(`Failed to fetch organization: ${orgError.message}`)
    console.log(`[${OPERATION_TYPE}] Step 8 successful.`);

    const formatTestResults = () => {
      const testsByCode: Record<string, { normalized_scores: unknown; detailed_result: string | null }> = {}
      testResults.forEach((tr: { tests: { code: string } | null; normalized_scores: unknown; detailed_result: string | null }) => {
        if (tr.tests?.code) {
          testsByCode[tr.tests.code] = {
            normalized_scores: tr.normalized_scores,
            detailed_result: tr.detailed_result
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

      return {
        big_five: bigFive,
        mbti: mbti,
        disc: disc,
        eq: eq,
        soft_skills: softSkills,
        motivation: motivation
      }
    }

    const testResultsFormatted = formatTestResults()

    const vacanciesText = vacancies?.map((v: { title: string; description: string | null; requirements: string | null; salary_min: number | null; salary_max: number | null; currency: string; employment_type: string | null }) => {
      let salaryInfo = 'Не указана'
      if (v.salary_min || v.salary_max) {
        salaryInfo = `${v.salary_min || 0} - ${v.salary_max || '∞'} ${v.currency || 'RUB'}`
      }
      
      return `--- ВАКАНСИЯ: ${v.title} ---
Зарплата: ${salaryInfo}
Тип занятости: ${v.employment_type || 'Не указан'}
Описание: ${v.description || 'Нет описания'}
Требования: ${v.requirements || 'Нет требований'}
---`
    }).join('\n\n') || 'Вакансии не указаны'

    const categoryField = payload.language === 'ru' ? 'name_ru' : payload.language === 'kk' ? 'name_kk' : 'name_en'
    const categoryName = candidate.professional_categories?.[categoryField] || 'Не указана'

    console.log(`[${OPERATION_TYPE}] Step 9: Fetching AI configuration.`);
    aiConfig = await getAIConfig(supabaseAdmin, OPERATION_TYPE)
    console.log(`[${OPERATION_TYPE}] Step 9 successful. Using provider: ${aiConfig.provider}, model: ${aiConfig.model_name}`);

    console.log(`[${OPERATION_TYPE}] Step 10: Building final prompt.`);
    const finalPrompt = aiConfig.prompt_text
      .replace('{full_name}', candidate.full_name || 'N/A')
      .replace('{email}', candidate.email || 'N/A')
      .replace('{phone}', candidate.phone || 'N/A')
      .replace('{category}', categoryName)
      .replace('{experience}', candidate.experience || 'Не указан')
      .replace('{education}', candidate.education || 'Не указано')
      .replace('{about}', candidate.about || 'Не указано')
      .replace('{skills}', skillsList.join(', ') || 'Нет навыков')
      .replace('{big_five_results}', testResultsFormatted.big_five)
      .replace('{mbti_result}', testResultsFormatted.mbti)
      .replace('{disc_results}', testResultsFormatted.disc)
      .replace('{eq_results}', testResultsFormatted.eq)
      .replace('{soft_skills_results}', testResultsFormatted.soft_skills)
      .replace('{motivation_results}', testResultsFormatted.motivation)
      .replace('{vacancies_descriptions}', vacanciesText)
      .replace('{culture_description}', organization?.culture_description || 'Не указана')
      .replace('{language}', payload.language)
    console.log(`[${OPERATION_TYPE}] Step 10 successful.`);

    console.log(`[${OPERATION_TYPE}] Step 11: Calling AI API.`);
    const { response: aiResponse, inputTokens, outputTokens } = await callAI(aiConfig, finalPrompt)
    console.log(`[${OPERATION_TYPE}] Step 11 successful. Received response from AI. Tokens: ${inputTokens} + ${outputTokens}`);

    console.log(`[${OPERATION_TYPE}] Step 12: Parsing JSON response.`);
    let analysisData: unknown = null;
    let htmlContent = '';
    
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      
      analysisData = JSON.parse(jsonString);
      console.log(`[${OPERATION_TYPE}] Step 12 successful. Parsed structured JSON.`);
      
      htmlContent = await marked.parse(aiResponse);
    } catch (e) {
      console.error(`[${OPERATION_TYPE}] Failed to parse JSON from AI response:`, e);
      htmlContent = await marked.parse(aiResponse);
      console.warn(`[${OPERATION_TYPE}] Using fallback: saved as markdown.`);
    }

    console.log(`[${OPERATION_TYPE}] Step 13: Saving result to database.`);
    
    const { data: existingAnalysis } = await supabaseAdmin
      .from('candidate_full_analysis')
      .select('id')
      .eq('candidate_id', payload.candidate_id)
      .eq('organization_id', payload.organization_id)
      .maybeSingle()

    let savedResult;
    if (existingAnalysis) {
      const { data, error: updateError } = await supabaseAdmin
        .from('candidate_full_analysis')
        .update({
          vacancy_ids: payload.vacancy_ids,
          created_by_hr_id: payload.hr_specialist_id,
          content_markdown: aiResponse,
          content_html: htmlContent,
          analysis_data: analysisData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAnalysis.id)
        .select()
        .single()

      if (updateError) throw new Error(`Failed to update full analysis: ${updateError.message}`)
      savedResult = data
      console.log(`[${OPERATION_TYPE}] Step 13 successful. Updated existing analysis ${existingAnalysis.id}.`);
    } else {
      const { data, error: insertError } = await supabaseAdmin
        .from('candidate_full_analysis')
        .insert({
          candidate_id: payload.candidate_id,
          organization_id: payload.organization_id,
          created_by_hr_id: payload.hr_specialist_id,
          vacancy_ids: payload.vacancy_ids,
          content_markdown: aiResponse,
          content_html: htmlContent,
          analysis_data: analysisData,
          is_public: false
        })
        .select()
        .single()

      if (insertError) throw new Error(`Failed to save full analysis: ${insertError.message}`)
      savedResult = data
      console.log(`[${OPERATION_TYPE}] Step 13 successful. Created new analysis with ID: ${savedResult.id}`);
    }

    console.log(`[${OPERATION_TYPE}] Step 14: Deducting tokens and logging operation.`);
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
        candidate_id: payload.candidate_id,
        vacancy_ids: payload.vacancy_ids,
        result_id: savedResult.id,
      },
    })
    console.log(`[${OPERATION_TYPE}] Step 14 successful.`);

    console.log(`[${OPERATION_TYPE}] Function finished successfully.`);
    return new Response(JSON.stringify({ 
      success: true, 
      result: savedResult,
      data: analysisData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(`[${OPERATION_TYPE}] Error caught in main block:`, error);
    if (payload && supabaseAdmin && aiConfig) {
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
          candidate_id: payload.candidate_id,
          vacancy_ids: payload.vacancy_ids,
        },
      })
    }
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
