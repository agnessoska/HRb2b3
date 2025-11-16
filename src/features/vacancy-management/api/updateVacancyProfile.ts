import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database'

type IdealProfile = Database['public']['Tables']['vacancies']['Row']['ideal_profile']

export const updateVacancyProfile = async ({
  vacancyId,
  idealProfile,
}: {
  vacancyId: string
  idealProfile: IdealProfile
}) => {
  const { data, error } = await supabase
    .from('vacancies')
    .update({ ideal_profile: idealProfile })
    .eq('id', vacancyId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
