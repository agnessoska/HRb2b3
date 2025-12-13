import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { InterviewSessionWithData } from '../types'

interface GenerateInterviewPlanPayload {
  candidate_id: string
  vacancy_id: string
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'en' | 'kk'
  additional_info?: string
}

interface GenerateInterviewPlanResponse {
  success: boolean
  data: InterviewSessionWithData
  error?: string
}

async function generateInterviewPlan(payload: GenerateInterviewPlanPayload): Promise<InterviewSessionWithData> {
  const { data, error } = await supabase.functions.invoke<GenerateInterviewPlanResponse>(
    'generate-structured-interview',
    {
      body: payload,
    }
  )

  if (error) {
    throw new Error(error.message || 'Failed to generate interview plan')
  }

  if (!data?.success || !data.data) {
    throw new Error(data?.error || 'Failed to generate interview plan')
  }

  return data.data as InterviewSessionWithData
}

export function useGenerateInterviewPlan() {
  return useMutation({
    mutationFn: generateInterviewPlan,
  })
}