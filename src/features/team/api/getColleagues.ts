import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useOrganization } from '@/shared/hooks/useOrganization'

export interface Colleague {
  id: string
  full_name: string | null
  role: string
  is_active: boolean
  created_at: string
  candidates_count?: number
}

export const useGetColleagues = () => {
  const { data: organization } = useOrganization()

  return useQuery({
    queryKey: ['colleagues', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return []

      // @ts-expect-error: RPC function not yet in generated types
      const { data, error } = await supabase.rpc('get_colleagues_with_stats', {
        p_organization_id: organization.id,
      })

      if (error) throw error
      return data as unknown as Colleague[]
    },
    enabled: !!organization?.id,
  })
}