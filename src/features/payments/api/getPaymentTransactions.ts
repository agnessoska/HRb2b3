import { supabase } from '@/shared/lib/supabase'
import { type TTransaction } from '../types'

export const getPaymentTransactions = async (
  organizationId: string,
): Promise<TTransaction[]> => {
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payment transactions:', error)
    throw new Error(error.message)
  }

  return data || []
}
