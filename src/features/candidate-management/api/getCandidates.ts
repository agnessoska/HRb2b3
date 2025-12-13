import { supabase } from '@/shared/lib/supabase'
import type { CandidateWithVacancies } from '@/shared/types/extended'

export async function getCandidates(organizationId: string): Promise<CandidateWithVacancies[]> {
  const { data, error } = await supabase
    .rpc('get_organization_candidates', { p_organization_id: organizationId })

  if (error) {
    throw error
  }

  return data as CandidateWithVacancies[]
}
