import type { Database } from '@/shared/types/database'

export type TTransaction =
  Database['public']['Tables']['payment_transactions']['Row']
