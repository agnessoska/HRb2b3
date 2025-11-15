import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/app/store/auth'

async function getOrganization(userId: string) {
  const { data: hrSpecialist, error: hrError } = await supabase
    .from('hr_specialists')
    .select('organization_id')
    .eq('user_id', userId)
    .single()

  if (hrError || !hrSpecialist) {
    throw new Error('Could not find HR specialist profile.')
  }

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', hrSpecialist.organization_id)
    .single()

  if (orgError) {
    throw orgError
  }

  return organization
}

export function useOrganization() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['organization', user?.id],
    queryFn: () => getOrganization(user!.id),
    enabled: !!user,
  })
}
