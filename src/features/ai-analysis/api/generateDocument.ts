import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { supabase } from '@/shared/lib/supabase'
import type { GeneratedDocumentResult } from '../types'

export type DocumentType = 'interview_invitation' | 'rejection_letter'

export interface GenerateDocumentParams {
  candidate_id: string
  vacancy_id?: string
  organization_id: string
  hr_specialist_id: string
  document_type: DocumentType
  additional_info: string
  language: 'ru' | 'kk' | 'en'
}

export const generateDocument = async (params: GenerateDocumentParams): Promise<GeneratedDocumentResult> => {
  const { data, error } = await supabase.functions.invoke('generate-document', {
    body: params,
  })

  if (error) {
    throw new Error(`Failed to generate document: ${error.message}`)
  }

  if (!data || !data.data) {
    throw new Error('Invalid response from server')
  }

  return data.data as GeneratedDocumentResult
}

export const useGenerateDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['ai-analysis', 'common'])

  return useMutation({
    mutationFn: generateDocument,
    onSuccess: (data) => {
      toast.success(t('generateDocument.success', 'Документ успешно сгенерирован!'))
      queryClient.invalidateQueries({ queryKey: ['documents', data.candidate_id] })
      queryClient.invalidateQueries({ queryKey: ['documents', data.candidate_id, data.organization_id] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
