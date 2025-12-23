import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { SmartApplication } from '@/shared/types/extended'

async function getApplicationsByVacancy(vacancyId: string): Promise<SmartApplication[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      compatibility_score,
      candidate_id,
      vacancy_id,
      organization_id,
      added_by_hr_id,
      has_full_analysis,
      latest_interview_id,
      interview_recommendation,
      sent_documents,
      candidate:candidates (
        id,
        user_id,
        full_name,
        phone,
        email,
        category_id,
        experience,
        education,
        about,
        tests_completed,
        tests_last_updated_at,
        is_public,
        avatar_url,
        invited_by_hr_id,
        invited_by_organization_id,
        created_at,
        updated_at,
        category:professional_categories (
          id,
          name_ru,
          name_en,
          name_kk,
          sort_order
        )
      )
    `
    )
    .eq('vacancy_id', vacancyId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications by vacancy:', error)
    throw new Error(error.message)
  }

  // Transform data to match SmartApplication type
  const transformedData = (data || []).map((app) => ({
    ...app,
    has_full_analysis: app.has_full_analysis ?? false,
    latest_interview_id: app.latest_interview_id ?? null,
    interview_recommendation: app.interview_recommendation ?? null,
    sent_documents: Array.isArray(app.sent_documents) ? app.sent_documents : [],
    candidate: {
      ...app.candidate,
      avatar_url: app.candidate?.avatar_url ?? null,
      category_name_ru: app.candidate?.category?.name_ru ?? null,
      category_name_en: app.candidate?.category?.name_en ?? null,
      category_name_kk: app.candidate?.category?.name_kk ?? null,
    }
  }))

  return transformedData as SmartApplication[]
}

export function useGetApplicationsByVacancy(vacancyId: string) {
  return useQuery({
    queryKey: ['applications', vacancyId],
    queryFn: () => getApplicationsByVacancy(vacancyId),
    enabled: !!vacancyId,
  })
}
