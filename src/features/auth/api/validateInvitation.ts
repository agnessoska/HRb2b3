import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

interface InvitationData {
  valid: boolean
  email?: string // Only for HR invitations
  organization_name?: string
  brand_logo_url?: string
  invited_by_hr_id?: string // Only for Candidate invitations
  invited_by_organization_id?: string // Only for Candidate invitations
  type?: 'hr' | 'candidate'
  error?: string
}

export const useValidateInvitation = (token: string | null) => {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null

      // 1. Try validate as HR invitation first
      const { data: hrData, error: hrError } = await supabase.rpc('validate_hr_invitation_token', {
        p_token: token,
      })

      if (!hrError && hrData && (hrData as unknown as { valid: boolean }).valid) {
        return hrData as unknown as InvitationData
      }

      // 2. If not HR, try validate as Candidate invitation
      const { data: candidateData, error: candidateError } = await supabase.rpc('validate_candidate_invitation_token', {
        p_token: token,
      })

      if (!candidateError && candidateData && (candidateData as unknown as { valid: boolean }).valid) {
        return candidateData as unknown as InvitationData
      }

      // If both failed, return invalid
      return { valid: false, error: 'Invalid token' } as InvitationData
    },
    enabled: !!token,
    retry: false,
  })
}