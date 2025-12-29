import { supabase } from '@/shared/lib/supabase'

export interface VacancySkill {
  canonical_skill: string;
  is_required: boolean;
  name?: string;
}

export async function getVacancySkills(vacancyId: string, lang: 'ru' | 'en' | 'kk' = 'ru'): Promise<VacancySkill[]> {
  const { data, error } = await supabase
    .from('vacancy_skills')
    .select(`
      canonical_skill,
      is_required
    `)
    .eq('vacancy_id', vacancyId);

  if (error) {
    console.error('Error loading vacancy skills:', error);
    return [];
  }

  // Fetch localized names from dictionary
  const canonicalNames = data.map(s => s.canonical_skill);
  const { data: dictData } = await supabase
    .from('skills_dictionary')
    .select('canonical_name, name')
    .in('canonical_name', canonicalNames)
    .eq('language', lang);

  return data.map(skill => ({
    ...skill,
    name: dictData?.find(d => d.canonical_name === skill.canonical_skill)?.name || skill.canonical_skill
  }));
}