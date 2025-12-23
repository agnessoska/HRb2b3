import { supabase } from '@/shared/lib/supabase'

export type UpdateCandidateProfilePayload = {
  full_name: string
  phone?: string | null
  category_id?: string | null
  experience?: string | null
  education?: string | null
  about?: string | null
  is_public?: boolean
  avatar_url?: string | null
  skills?: string[]
}

export const updateCandidateProfile = async (
  candidateId: string,
  payload: UpdateCandidateProfilePayload
): Promise<void> => {
  const { skills, ...profileData } = payload

  // Update profile data
  const { error: profileError } = await supabase
    .from('candidates')
    .update(profileData)
    .eq('id', candidateId)

  if (profileError) {
    throw new Error(profileError.message)
  }

  // Update skills if provided
  if (skills) {
    // Delete existing skills
    const { error: deleteError } = await supabase
      .from('candidate_skills')
      .delete()
      .eq('candidate_id', candidateId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    // Insert new skills
    if (skills.length > 0) {
      const skillsToInsert = skills.map((skill) => ({
        candidate_id: candidateId,
        canonical_skill: skill,
      }))

      const { error: insertError } = await supabase
        .from('candidate_skills')
        .insert(skillsToInsert)

      if (insertError) {
        throw new Error(insertError.message)
      }
    }
  }
}
