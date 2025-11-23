import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useOrganization } from '@/shared/hooks/useOrganization'

export interface Invitation {
  type: 'candidate' | 'hr'
  id: string
  token: string
  created_at: string
  expires_at: string | null
  is_used: boolean
  used_at: string | null
  created_by_name: string
  created_by_user_id: string
  used_by_name: string | null
  used_by_user_id: string | null
  invite_email: string | null
}

export const useGetOrganizationInvitations = () => {
  const { data: organization } = useOrganization()

  return useQuery({
    queryKey: ['organization-invitations', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return []

      const { data, error } = await supabase.rpc('get_organization_invitations', {
        p_organization_id: organization.id,
      })

      if (error) throw error
      return data as unknown as Invitation[]
    },
    enabled: !!organization?.id,
  })
}