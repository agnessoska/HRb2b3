import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

export interface CandidateStatus {
  email: string
  status: 'registered' | 'invited' | 'none'
  candidate_id?: string
  invite_token?: string
}

export const checkCandidatesStatus = async (emails: string[], hrId: string): Promise<CandidateStatus[]> => {
  if (emails.length === 0) return []

  // @ts-expect-error RPC function type is not yet generated
  const { data, error } = await supabase.rpc('check_candidates_status', {
    p_emails: emails,
    p_hr_id: hrId,
  })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any as CandidateStatus[]
}

export const useCheckCandidatesStatus = (emails: string[], hrId: string | undefined) => {
  return useQuery({
    queryKey: ['candidates-status', emails, hrId],
    queryFn: () => checkCandidatesStatus(emails, hrId!),
    enabled: !!hrId && emails.length > 0,
    staleTime: 1000 * 60, // 1 minute cache
  })
}