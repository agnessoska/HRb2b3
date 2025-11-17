import type { Database } from './database'

export type TUser = {
  candidate: Database['public']['Tables']['candidates']['Row']
  hr: Database['public']['Tables']['hr_specialists']['Row']
}
