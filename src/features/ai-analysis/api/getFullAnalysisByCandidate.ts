import { supabase } from '@/shared/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export const getFullAnalysisByCandidate = async (candidateId: string, organizationId: string) => {
  const { data, error } = await supabase
    .from('candidate_full_analysis')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const useGetFullAnalysisByCandidate = (candidateId: string, organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['full-analysis', candidateId, organizationId],
    queryFn: () => getFullAnalysisByCandidate(candidateId, organizationId!),
    enabled: !!candidateId && !!organizationId,
  })
}
