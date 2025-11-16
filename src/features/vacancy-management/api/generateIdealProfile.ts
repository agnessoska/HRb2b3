import { supabase } from '@/shared/lib/supabase'

interface GenerateIdealProfilePayload {
  vacancy_id: string
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}

export const generateIdealProfile = async (
  payload: GenerateIdealProfilePayload
) => {
  const { data, error } = await supabase.functions.invoke(
    'generate-ideal-profile',
    {
      body: payload,
    }
  )

  if (error) {
    console.error('Error generating ideal profile:', error)
    throw error
  }

  return data
}
