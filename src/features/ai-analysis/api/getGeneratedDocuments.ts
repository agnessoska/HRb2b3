import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { GeneratedDocumentResult } from '../types'

export const getGeneratedDocumentsByCandidate = async (
  candidateId: string,
  organizationId: string
): Promise<GeneratedDocumentResult[]> => {
  const { data, error } = await supabase
    .from('generated_documents')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data as GeneratedDocumentResult[]) || []
}

export const useGetGeneratedDocumentsByCandidate = (candidateId: string, organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['documents', candidateId, organizationId],
    queryFn: () => getGeneratedDocumentsByCandidate(candidateId, organizationId!),
    enabled: !!candidateId && !!organizationId,
  })
}

export const getDocumentById = async (
  documentId: string,
  organizationId: string
): Promise<GeneratedDocumentResult | null> => {
  const { data, error } = await supabase
    .from('generated_documents')
    .select('*')
    .eq('id', documentId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Failed to fetch document:', error)
    return null
  }

  return data as GeneratedDocumentResult
}

export const useGetDocumentById = (documentId: string | null, organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['document', documentId, organizationId],
    queryFn: () => getDocumentById(documentId!, organizationId!),
    enabled: !!documentId && !!organizationId,
  })
}
