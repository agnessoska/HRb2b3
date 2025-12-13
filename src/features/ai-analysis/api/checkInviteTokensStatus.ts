import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

export interface TokenStatus {
  token: string
  is_used: boolean
}

export const checkInviteTokensStatus = async (tokens: string[]): Promise<TokenStatus[]> => {
  if (tokens.length === 0) return []

  // @ts-expect-error RPC function type is not yet generated
  const { data, error } = await supabase.rpc('check_invite_tokens_status', {
    p_tokens: tokens,
  })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any as TokenStatus[]
}

export const useCheckInviteTokensStatus = (tokens: string[]) => {
  return useQuery({
    queryKey: ['invite-tokens-status', tokens],
    queryFn: () => checkInviteTokensStatus(tokens),
    enabled: tokens.length > 0,
    staleTime: 1000 * 30, // 30 seconds cache
    refetchOnWindowFocus: true,
  })
}
