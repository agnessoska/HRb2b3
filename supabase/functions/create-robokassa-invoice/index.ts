import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import crypto from 'https://deno.land/std@0.168.0/node/crypto.ts'

// Self-contained CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RobokassaPayload {
  organization_id: string
  amount: number
  tokens: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { organization_id, amount, tokens }: RobokassaPayload = await req.json()
    if (!organization_id || !amount || !tokens) {
      throw new Error('Missing required fields: organization_id, amount, and tokens are required.')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        organization_id,
        amount,
        tokens_amount: tokens,
        status: 'pending',
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    const merchantLogin = Deno.env.get('ROBOKASSA_MERCHANT_LOGIN')
    const password_1 = Deno.env.get('ROBOKASSA_PASSWORD_1')
    const invoiceId = transaction.id
    const outSum = amount.toFixed(2)
    const description = `Покупка ${tokens.toLocaleString()} токенов для организации ${organization_id}`
    
    // Custom parameters for signature must be sorted alphabetically
    const shp_org_id = organization_id
    const shp_tokens = tokens
    const signatureString = `${merchantLogin}:${outSum}:${invoiceId}:${password_1}:shp_org_id=${shp_org_id}:shp_tokens=${shp_tokens}`
    
    const signatureValue = crypto.createHash('md5').update(signatureString).digest('hex')

    const isTest = Deno.env.get('ROBOKASSA_IS_TEST') === 'true' ? 1 : 0;

    const paymentParams = {
      MerchantLogin: merchantLogin,
      OutSum: outSum,
      InvId: invoiceId,
      Description: description,
      SignatureValue: signatureValue,
      IsTest: isTest,
      shp_org_id: shp_org_id,
      shp_tokens: shp_tokens,
    }

    return new Response(JSON.stringify({ success: true, params: paymentParams }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
