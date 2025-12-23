import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/app/store/auth'

async function getOrganization(userId: string, role: string) {
  let organizationId: string | null = null;

  if (role === 'hr') {
    const { data: hrSpecialist, error: hrError } = await supabase
      .from('hr_specialists')
      .select('organization_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (hrError) {
      console.error('Error fetching HR specialist:', hrError)
      throw hrError
    }
    organizationId = hrSpecialist?.organization_id || null;
  } else if (role === 'candidate') {
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('invited_by_organization_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (candidateError) {
      console.error('Error fetching Candidate:', candidateError)
      throw candidateError
    }
    organizationId = candidate?.invited_by_organization_id || null;
  }

  if (!organizationId) {
    return null
  }

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .maybeSingle()

  if (orgError) {
    console.error('Error fetching organization:', orgError)
    throw orgError
  }

  return organization
}

export function useOrganization() {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)

  return useQuery({
    queryKey: ['organization', user?.id, role],
    queryFn: () => getOrganization(user!.id, role!),
    enabled: !!user && !!role,
  })
}
