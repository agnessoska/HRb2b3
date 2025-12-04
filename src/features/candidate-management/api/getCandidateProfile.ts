import { supabase } from '@/shared/lib/supabase'
import { type TUser } from '@/shared/types/user'

export type CandidateProfile = TUser['candidate'] & {
  candidate_skills: { canonical_skill: string }[]
}

export const getCandidateProfile = async (
  userId: string,
): Promise<CandidateProfile> => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*, candidate_skills(canonical_skill)')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching candidate profile:', error)
    throw new Error(error.message)
  }

  return data
}
