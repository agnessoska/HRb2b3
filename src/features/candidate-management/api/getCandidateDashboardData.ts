import { supabase } from '@/shared/lib/supabase'
import type { TDashboardData } from '../types'

export const getCandidateDashboardData = async (
  userId: string,
): Promise<TDashboardData> => {
  const { data, error } = await supabase.rpc('get_candidate_dashboard_data', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching candidate dashboard data:', error)
    throw new Error(error.message)
  }

  // The RPC function returns a single jsonb object which we cast to our strict type
  return data as unknown as TDashboardData
}

export type { TDashboardData }