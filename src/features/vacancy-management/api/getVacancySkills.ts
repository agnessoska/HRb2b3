import { supabase } from '@/shared/lib/supabase'

export async function getVacancySkills(vacancyId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('vacancy_skills')
    .select('canonical_skill')
    .eq('vacancy_id', vacancyId)

  if (error) {
    console.error('Error loading vacancy skills:', error)
    return []
  }

  return data.map(skill => skill.canonical_skill)
}