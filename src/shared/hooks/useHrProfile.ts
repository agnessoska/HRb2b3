import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/app/store/auth'
import type { Database } from '@/shared/types/database'

type HrProfile = Database['public']['Tables']['hr_specialists']['Row']

async function getHrProfile(userId: string): Promise<HrProfile | null> {
  const { data, error } = await supabase
    .from('hr_specialists')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching HR profile:', error)
    // Return null instead of throwing, allows for graceful UI handling
    return null
  }

  return data
}

export function useHrProfile() {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['hrProfile', user?.id],
    queryFn: () => getHrProfile(user!.id),
    enabled: !!user,
  })
}
