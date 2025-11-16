import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

interface AnalyzeResumesPayload {
  organization_id: string
  hr_specialist_id: string
  vacancy_ids: string[]
  resumes: {
    filename: string
    content_base64: string
  }[]
  additional_notes?: string
  language: 'ru' | 'kk' | 'en'
}

const analyzeResumes = async (payload: AnalyzeResumesPayload) => {
  const { data, error } = await supabase.functions.invoke('analyze-resumes', {
    body: payload,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

type AnalyzeResumesResult = Awaited<ReturnType<typeof analyzeResumes>>;

export const useAnalyzeResumes = (options?: UseMutationOptions<AnalyzeResumesResult, Error, AnalyzeResumesPayload>) => {
  return useMutation({
    mutationFn: analyzeResumes,
    ...options,
  })
}
