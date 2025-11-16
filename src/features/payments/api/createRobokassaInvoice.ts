import { supabase } from '@/shared/lib/supabase'

export type RobokassaInvoicePayload = {
  organization_id: string
  amount: number
  tokens: number
}

export type RobokassaParams = {
  MerchantLogin: string
  OutSum: string
  InvId: number
  Description: string
  SignatureValue: string
  IsTest: number
  shp_org_id: string
  shp_tokens: number
}

export const createRobokassaInvoice = async (
  payload: RobokassaInvoicePayload
): Promise<RobokassaParams> => {
  const { data, error } = await supabase.functions.invoke('create-robokassa-invoice', {
    body: payload,
  })

  if (error) {
    throw new Error(`Failed to create Robokassa invoice: ${error.message}`)
  }

  if (!data.success) {
    throw new Error(`Failed to create Robokassa invoice: ${data.error}`)
  }

  return data.params
}
