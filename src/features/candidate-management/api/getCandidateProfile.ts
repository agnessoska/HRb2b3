import { supabase } from '@/shared/lib/supabase'
import { type TUser } from '@/shared/types/user'

export type CandidateProfile = TUser['candidate'] & {
  candidate_skills: { canonical_skill: string }[]
  category?: { name_ru: string; name_en: string; name_kk: string } | null
}

export const getCandidateProfile = async (
  userId: string,
): Promise<CandidateProfile> => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*, candidate_skills(canonical_skill), category:professional_categories(*)')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching candidate profile:', error)
    throw new Error(error.message)
  }

  return data
}
