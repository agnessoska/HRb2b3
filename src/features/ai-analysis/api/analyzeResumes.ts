import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

interface AnalyzeResumesPayload {
  organization_id: string
  hr_specialist_id: string
  vacancy_ids: string[]
  file_paths: string[] // Changed from resumes object to file paths
  additional_notes?: string
  language: 'ru' | 'kk' | 'en'
  save_to_db?: boolean
}

export interface AnalyzeResumesResponse {
  success: boolean
  result: {
    id: string
    content_html: string | null
    content_markdown: string | null
    created_at: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analysis_data: any
    total_tokens?: number
  }
  data?: {
    content_html: string | null
    content_markdown: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analysis_data: any
    total_tokens?: number
  }
  total_tokens?: number
}

const analyzeResumes = async (payload: AnalyzeResumesPayload): Promise<AnalyzeResumesResponse> => {
  const { data, error } = await supabase.functions.invoke('analyze-resumes', {
    body: payload,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const useAnalyzeResumes = (options?: UseMutationOptions<AnalyzeResumesResponse, Error, AnalyzeResumesPayload>) => {
  return useMutation({
    mutationFn: analyzeResumes,
    retry: 0,
    ...options,
  })
}
