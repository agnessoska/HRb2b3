import { supabase } from '@/shared/lib/supabase'

export async function getCandidates(organizationId: string) {
  const { data, error } = await supabase
    .rpc('get_organization_candidates', { p_organization_id: organizationId })

  if (error) {
    throw error
  }

  return data
}
