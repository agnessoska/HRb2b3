import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database'

type VacancyUpdate = Database['public']['Tables']['vacancies']['Update'] & {
  skills?: string[]
}

export const updateVacancy = async ({
  id,
  skills,
  ...updates
}: VacancyUpdate & { id: string }) => {
  const { data, error } = await supabase
    .from('vacancies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (skills) {
    // First, delete existing skills
    const { error: deleteError } = await supabase
      .from('vacancy_skills')
      .delete()
      .eq('vacancy_id', id)

    if (deleteError) {
      console.error('Error deleting vacancy skills:', deleteError)
    }

    // Then insert new skills if any
    if (skills.length > 0) {
      const skillsToInsert = skills.map((skill) => ({
        vacancy_id: id,
        canonical_skill: skill,
        is_required: false,
      }))

      const { error: insertError } = await supabase
        .from('vacancy_skills')
        .insert(skillsToInsert)

      if (insertError) {
        console.error('Error inserting vacancy skills:', insertError)
      }
    }
  }

  return data
}