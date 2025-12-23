import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { AnalysisCandidate } from '../types'

interface CreateCandidatePayload {
  candidateData: AnalysisCandidate
  vacancyId: string
  hrId: string
}

interface CreateCandidateResponse {
  candidate_id: string
  application_id: string
  invite_token: string
}

export const createCandidateFromAnalysis = async ({
  candidateData,
  vacancyId,
  hrId,
}: CreateCandidatePayload): Promise<CreateCandidateResponse> => {
  const { data, error } = await supabase.rpc('create_candidate_from_analysis', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p_candidate_data: candidateData as any,
    p_vacancy_id: vacancyId,
    p_hr_id: hrId,
  })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any as CreateCandidateResponse
}

export const useCreateCandidateFromAnalysis = () => {
  return useMutation({
    mutationFn: createCandidateFromAnalysis,
  })
}