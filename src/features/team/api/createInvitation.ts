import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

interface CreateInvitationParams {
  email?: string
}

interface CreateInvitationResponse {
  success: boolean
  token?: string
  expires_at?: string
  error?: string
}

export const useCreateInvitation = () => {
  return useMutation({
    mutationFn: async ({ email }: CreateInvitationParams) => {
      const { data, error } = await supabase.rpc('generate_hr_invitation_token', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p_email: (email ?? null) as any,
      })

      if (error) throw error
      return data as unknown as CreateInvitationResponse
    },
  })
}