import { supabase } from '@/shared/lib/supabase'
import { type ChatMessage } from '../types'

export const getRecentChatMessages = async (
  candidateId: string,
  limit = 3,
): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(
      `
      *,
      chat_rooms!inner (
        hr_specialists (
          full_name
        )
      )
    `,
    )
    .eq('chat_rooms.candidate_id', candidateId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent chat messages:', error)
    throw new Error(error.message)
  }

  return data.reverse() || []
}
