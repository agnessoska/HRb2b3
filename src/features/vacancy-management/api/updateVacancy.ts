import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database'

type VacancyUpdate = Database['public']['Tables']['vacancies']['Update']

export const updateVacancy = async ({
  id,
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

  return data
}