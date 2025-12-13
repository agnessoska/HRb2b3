import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useOrganization } from '@/shared/hooks/useOrganization'

export const getVacancies = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const useGetVacancies = () => {
  const { data: organization } = useOrganization()

  return useQuery({
    queryKey: ['vacancies', organization?.id],
    queryFn: () => {
      if (!organization?.id) {
        return Promise.resolve([])
      }
      return getVacancies(organization.id)
    },
    enabled: !!organization?.id,
  })
}

export const getVacanciesByIds = async (vacancyIds: string[]) => {
  if (vacancyIds.length === 0) return []
  
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
    .in('id', vacancyIds)

  if (error) throw error
  return data
}

export const useVacanciesByIds = (vacancyIds: string[]) => {
  return useQuery({
    queryKey: ['vacancies', vacancyIds],
    queryFn: () => getVacanciesByIds(vacancyIds),
    enabled: vacancyIds.length > 0,
  })
}
