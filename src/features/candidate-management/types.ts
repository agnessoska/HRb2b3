import type { Database } from '@/shared/types/database'

type ApplicationRow = Database['public']['Tables']['applications']['Row']
type VacancyRow = Database['public']['Tables']['vacancies']['Row']
type OrganizationRow = Database['public']['Tables']['organizations']['Row']

export type TActiveApplication = ApplicationRow & {
  vacancies: VacancyRow & {
    organizations: OrganizationRow
  }
}
