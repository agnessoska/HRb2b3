import { supabase } from '@/shared/lib/supabase'

export async function getVacancies(organizationId: string) {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
