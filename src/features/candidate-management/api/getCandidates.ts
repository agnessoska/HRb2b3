import { supabase } from '@/shared/lib/supabase'

export async function getCandidates(organizationId: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('invited_by_organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
