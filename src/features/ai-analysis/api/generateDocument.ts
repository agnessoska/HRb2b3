import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database'

export type DocumentType = 'interview_invitation' | 'job_offer' | 'rejection_letter'

export interface GenerateDocumentParams {
  candidate_id: string
  vacancy_id?: string
  organization_id: string
  hr_specialist_id: string
  document_type: DocumentType
  additional_info: string
  language: 'ru' | 'kk' | 'en'
}

export const generateDocument = async (params: GenerateDocumentParams) => {
  const { data, error } = await supabase.functions.invoke('generate-document', {
    body: params,
  })

  if (error) {
    throw new Error(`Failed to generate document: ${error.message}`)
  }

  return data.data as Database['public']['Tables']['generated_documents']['Row']
}

export const useGenerateDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateDocument,
    onSuccess: (data) => {
      toast.success('Document generated successfully!')
      // Invalidate queries to refetch the list of documents for the candidate
      queryClient.invalidateQueries({ queryKey: ['documents', data.candidate_id] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
