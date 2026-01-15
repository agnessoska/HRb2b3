import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { toast } from 'sonner'

interface CompareCandidatesParams {
  vacancy_id: string
  candidate_ids: string[]
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'en' | 'kk'
}

const compareCandidates = async (params: CompareCandidatesParams) => {
  const { data, error } = await supabase.functions.invoke('compare-candidates', {
    body: params,
  })

  if (error) {
    throw new Error(`Failed to compare candidates: ${error.message}`)
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data
}

export const useCompareCandidates = () => {
  return useMutation({
    mutationFn: compareCandidates,
    retry: 0,
    onSuccess: () => {
      toast.success('Comparison generated successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate comparison: ${error.message}`)
    },
  })
}
