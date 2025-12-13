import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { ComparisonResult } from '../types'

export async function getComparisonsByVacancy(vacancyId: string): Promise<ComparisonResult[]> {
  const { data, error } = await supabase
    .from('candidate_comparisons')
    .select('*')
    .eq('vacancy_id', vacancyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comparisons:', error)
    throw new Error(error.message)
  }

  return (data || []) as unknown as ComparisonResult[]
}

export function useGetComparisonsByVacancy(vacancyId: string) {
  return useQuery({
    queryKey: ['comparisons', vacancyId],
    queryFn: () => getComparisonsByVacancy(vacancyId),
    enabled: !!vacancyId,
  })
}

export async function getComparisonById(comparisonId: string): Promise<ComparisonResult | null> {
  const { data, error } = await supabase
    .from('candidate_comparisons')
    .select('*')
    .eq('id', comparisonId)
    .single()

  if (error) {
    console.error('Error fetching comparison:', error)
    throw new Error(error.message)
  }

  return data as unknown as ComparisonResult
}

export function useGetComparisonById(comparisonId: string | null) {
  return useQuery({
    queryKey: ['comparison', comparisonId],
    queryFn: () => getComparisonById(comparisonId!),
    enabled: !!comparisonId,
  })
}