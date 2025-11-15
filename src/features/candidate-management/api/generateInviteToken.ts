import { supabase } from '@/shared/lib/supabase'

interface GenerateTokenResponse {
  success: boolean
  token: string
  token_id: string
  invite_url: string
  tokens_spent: number
  new_balance: number
}

export async function generateInviteToken(): Promise<GenerateTokenResponse> {
  const { data, error } = await supabase.rpc('generate_invitation_token')

  if (error) {
    throw new Error(error.message)
  }

  // The RPC function is designed to be called by an authenticated user,
  // so we don't need to pass the hr_specialist_id explicitly.
  // Supabase handles it based on the user's session.
  return data as unknown as GenerateTokenResponse
}
