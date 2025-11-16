import { supabase } from '@/shared/lib/supabase'
import type { Tables } from '@/shared/types/database'
import { useMutation } from '@tanstack/react-query'

export type FullAnalysis = Tables<'candidate_full_analysis'>

export interface GenerateFullAnalysisPayload {
  candidate_id: string
  vacancy_ids: string[]
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}

export const generateFullAnalysis = async (payload: GenerateFullAnalysisPayload) => {
  const { data, error } = await supabase.functions.invoke('generate-full-analysis', {
    body: payload,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const useGenerateFullAnalysis = (
  options: {
    onSuccess?: (data: FullAnalysis) => void
    onError?: (error: Error) => void
  } = {}
) => {
  return useMutation({
    mutationFn: generateFullAnalysis,
    onSuccess: options.onSuccess,
    onError: options.onError,
  })
}
