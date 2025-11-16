import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

export const getCandidateById = async (candidateId: string) => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const useGetCandidateById = (candidateId: string) => {
  return useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => getCandidateById(candidateId),
    enabled: !!candidateId,
  })
}
