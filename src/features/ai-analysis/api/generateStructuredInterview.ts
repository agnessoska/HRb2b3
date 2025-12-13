import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useHrProfile } from '@/shared/hooks/useHrProfile'

interface GenerateStructuredInterviewPayload {
  candidate_id: string
  vacancy_id: string
  language: 'ru' | 'kk' | 'en'
  additional_info?: string
}

const generateStructuredInterview = async (
  payload: GenerateStructuredInterviewPayload,
  hr_specialist_id: string,
  organization_id: string
) => {
  const { data, error } = await supabase.functions.invoke('generate-structured-interview', {
    body: {
      ...payload,
      hr_specialist_id,
      organization_id,
    },
  })

  if (error) {
    throw new Error(`Failed to generate structured interview: ${error.message}`)
  }

  if (!data.success) {
    throw new Error(data.error || 'An unknown error occurred during generation.')
  }

  return data.data
}

export const useGenerateStructuredInterview = () => {
  const queryClient = useQueryClient()
  const { data: hrProfile } = useHrProfile()

  return useMutation({
    mutationFn: (payload: GenerateStructuredInterviewPayload) => {
      if (!hrProfile?.id || !hrProfile.organization_id) {
        throw new Error('HR profile is not loaded.')
      }
      return generateStructuredInterview(payload, hrProfile.id, hrProfile.organization_id)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['generated-documents', variables.candidate_id],
      })
    },
  })
}
