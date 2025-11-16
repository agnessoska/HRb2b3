import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database'

export const getVacancyById = async (
  vacancyId: string
): Promise<Database['public']['Tables']['vacancies']['Row'] | null> => {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
    .eq('id', vacancyId)
    .single()

  if (error) {
    console.error('Error fetching vacancy:', error)
    throw error
  }

  return data
}
