import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useHrProfile } from '@/shared/hooks/useHrProfile'

export const useGetResumeAnalyses = () => {
  const { data: organization } = useOrganization()
  const { data: hrProfile } = useHrProfile()

  return useQuery({
    queryKey: ['resume-analyses', organization?.id, hrProfile?.id],
    queryFn: async () => {
      if (!organization?.id || !hrProfile?.id) return []

      const { data, error } = await supabase
        .from('resume_analysis_results')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    enabled: !!organization?.id && !!hrProfile?.id,
  })
}