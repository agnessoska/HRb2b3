import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

interface UpdateInvitePayload {
  analysisId: string
  candidateIndex: number
  inviteToken: string
}

export const updateAnalysisInvite = async ({
  analysisId,
  candidateIndex,
  inviteToken,
}: UpdateInvitePayload) => {
  const { data, error } = await supabase.rpc('update_analysis_candidate_invite', {
    p_analysis_id: analysisId,
    p_candidate_index: candidateIndex,
    p_invite_token: inviteToken,
  })

  if (error) throw error
  return data
}

export const useUpdateAnalysisInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAnalysisInvite,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['resume-analysis', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['resume-analyses'] })
    },
  })
}