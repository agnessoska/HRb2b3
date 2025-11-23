import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database'

type VacancyInsert = Database['public']['Tables']['vacancies']['Insert'] & {
  skills?: string[]
}

export async function createVacancy(vacancyData: VacancyInsert) {
  const { skills, ...vacancy } = vacancyData

  const { data, error } = await supabase
    .from('vacancies')
    .insert(vacancy)
    .select()
    .single()

  if (error) {
    throw error
  }

  if (skills && skills.length > 0) {
    const skillsToInsert = skills.map((skill) => ({
      vacancy_id: data.id,
      canonical_skill: skill,
      is_required: false, // Default to false for now, could be improved later
    }))

    const { error: skillsError } = await supabase
      .from('vacancy_skills')
      .insert(skillsToInsert)

    if (skillsError) {
      console.error('Error inserting vacancy skills:', skillsError)
      // We don't throw here to avoid breaking the vacancy creation flow,
      // but in a real app we might want to handle this better (e.g. rollback)
    }
  }

  return data
}
