import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/shared/lib/supabase';
import { useTranslation } from 'react-i18next';

export type DocumentType = 'interview_invitation' | 'job_offer' | 'rejection_letter';

interface GenerateDocumentPayload {
  candidate_id: string;
  vacancy_id?: string;
  document_type: DocumentType;
  additional_info: string;
  language: 'ru' | 'kk' | 'en';
}

const generateDocument = async (payload: GenerateDocumentPayload) => {
  const { data, error } = await supabase.functions.invoke('generate-document', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useGenerateDocument = (options?: {
  onSuccess?: (data: any) => void;
}) => {
  const { t } = useTranslation('ai-analysis');

  return useMutation({
    mutationFn: generateDocument,
    onSuccess: (data) => {
      toast.success(t('generateDocument.notifications.success'));
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(t('generateDocument.notifications.error'), {
        description: error.message,
      });
    },
  });
};
