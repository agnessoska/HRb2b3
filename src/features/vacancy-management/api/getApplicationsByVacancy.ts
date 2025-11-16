import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'

export interface ApplicationWithCandidate {
  id: string
  candidates: {
    id: string
    full_name: string | null
  } | null
}

async function getApplicationsByVacancy(vacancyId: string): Promise<ApplicationWithCandidate[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      candidates (
        id,
        full_name
      )
    `
    )
    .eq('vacancy_id', vacancyId)

  if (error) {
    console.error('Error fetching applications by vacancy:', error)
    throw new Error(error.message)
  }

  return data || []
}

export function useGetApplicationsByVacancy(vacancyId: string) {
  return useQuery({
    queryKey: ['applications', vacancyId],
    queryFn: () => getApplicationsByVacancy(vacancyId),
    enabled: !!vacancyId,
  })
}
