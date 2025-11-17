import { supabase } from '@/shared/lib/supabase'
import { type TUser } from '@/shared/types/user'

export const getCandidateProfile = async (
  userId: string,
): Promise<TUser['candidate']> => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching candidate profile:', error)
    throw new Error(error.message)
  }

  return data
}
