import { supabase } from '@/shared/lib/supabase'
import { type TAiOperation } from '../types'

export const getAiOperationsLog = async (
  organizationId: string,
): Promise<TAiOperation[]> => {
  const { data, error } = await supabase
    .from('ai_operations_log')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching AI operations log:', error)
    throw new Error(error.message)
  }

  return data || []
}
