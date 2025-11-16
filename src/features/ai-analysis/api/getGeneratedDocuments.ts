import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

export const getGeneratedDocumentsByCandidate = async (candidateId: string, organizationId?: string) => {
  if (!organizationId) return []

  const { data, error } = await supabase
    .from('generated_documents')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const useGetGeneratedDocumentsByCandidate = (candidateId: string, organizationId?: string) => {
  return useQuery({
    queryKey: ['documents', candidateId],
    queryFn: () => getGeneratedDocumentsByCandidate(candidateId, organizationId),
    enabled: !!candidateId && !!organizationId,
  })
}
