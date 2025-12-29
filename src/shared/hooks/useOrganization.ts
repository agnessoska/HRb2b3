import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/app/store/auth'
import type { Database } from '@/shared/types/database'

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
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['organization', user?.id, role],
    queryFn: () => getOrganization(user!.id, role!),
    enabled: !!user && !!role,
  })

  // Set up Realtime subscription for balance updates
  useEffect(() => {
    if (!query.data?.id) return

    const channel = supabase
      .channel(`org-balance-${query.data.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organizations',
          filter: `id=eq.${query.data.id}`
        },
        (payload) => {
          // Use bracket notation to avoid any potential keyword issues with .new
          const newData = payload['new'] as Database['public']['Tables']['organizations']['Row']
          console.log('Organization balance updated via Realtime CDC:', newData)
          // Update the cache with new organization data
          queryClient.setQueryData(['organization', user?.id, role], newData)
        }
      )
      .on(
        'broadcast',
        { event: 'balance_updated' },
        (payload: { payload: { organization_id: string; total_tokens: number } }) => {
          console.log('Organization balance updated via Realtime Broadcast:', payload)
          // Force refetch to get accurate balance
          queryClient.invalidateQueries({ queryKey: ['organization', user?.id, role] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [query.data?.id, queryClient, user?.id, role])

  return query
}
