import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { AnalysisData, AnalysisResult } from '../types'

export const getResumeAnalysisById = async (id: string): Promise<AnalysisResult> => {
  const { data, error } = await supabase
    .from('resume_analysis_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  
  return {
    ...data,
    analysis_data: data.analysis_data as unknown as AnalysisData | null
  }
}

export const useGetResumeAnalysisById = (id: string, initialData?: AnalysisResult) => {
  return useQuery({
    queryKey: ['resume-analysis', id],
    queryFn: () => getResumeAnalysisById(id),
    initialData,
    enabled: !!id,
  })
}