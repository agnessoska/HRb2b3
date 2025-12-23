import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

export interface InvitationData {
  valid: boolean
  email?: string // Only for HR invitations
  organization_name?: string
  brand_logo_url?: string
  invited_by_hr_id?: string // Only for Candidate invitations
  invited_by_organization_id?: string // Only for Candidate invitations
  type?: 'hr' | 'candidate'
  error?: string
}

interface RPCResponse {
  valid: boolean
  email?: string
  organization_name?: string
  brand_logo_url?: string
  invited_by_hr_id?: string
  invited_by_organization_id?: string
}

export const useValidateInvitation = (token: string | null) => {
  return useQuery<InvitationData, Error>({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return { valid: false, error: 'No token' }

      // 1. Try validate as HR invitation first
      const { data: hrData, error: hrError } = await supabase.rpc('validate_hr_invitation_token', {
        p_token: token,
      })

      if (!hrError && hrData && (hrData as unknown as RPCResponse).valid) {
        const data = hrData as unknown as RPCResponse
        return {
          valid: true,
          email: data.email,
          organization_name: data.organization_name,
          brand_logo_url: data.brand_logo_url,
          type: 'hr'
        }
      }

      // 2. If not HR, try validate as Candidate invitation
      const { data: candidateData, error: candidateError } = await supabase.rpc('validate_candidate_invitation_token', {
        p_token: token,
      })

      if (!candidateError && candidateData && (candidateData as unknown as RPCResponse).valid) {
        const data = candidateData as unknown as RPCResponse
        return {
          valid: true,
          organization_name: data.organization_name,
          brand_logo_url: data.brand_logo_url,
          invited_by_hr_id: data.invited_by_hr_id,
          invited_by_organization_id: data.invited_by_organization_id,
          type: 'candidate'
        }
      }

      // If both failed, return invalid
      return { valid: false, error: 'Invalid token' }
    },
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}