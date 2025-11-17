import { supabase } from '@/shared/lib/supabase'
import { type TActiveApplication } from '../types'

export const getActiveApplications = async (
  candidateId: string,
): Promise<TActiveApplication[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      *,
      vacancies (
        title,
        organizations (
          name
        )
      )
    `,
    )
    .eq('candidate_id', candidateId)
    .in('status', ['invited', 'testing', 'evaluated', 'interview', 'offer'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active applications:', error)
    throw new Error(error.message)
  }

  return (data as TActiveApplication[]) || []
}
