import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database'

type VacancyInsert = Database['public']['Tables']['vacancies']['Insert']

export async function createVacancy(vacancyData: VacancyInsert) {
  const { data, error } = await supabase
    .from('vacancies')
    .insert(vacancyData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
