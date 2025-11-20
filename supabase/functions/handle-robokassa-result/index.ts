import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import crypto from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
  try {
    const params = new URL(req.url).searchParams
    const outSum = params.get('OutSum')
    const invId = params.get('InvId')
    const signatureValue = params.get('SignatureValue')
    const shp_org_id = params.get('shp_org_id')
    const shp_tokens = params.get('shp_tokens')

    if (!outSum || !invId || !signatureValue || !shp_org_id || !shp_tokens) {
      throw new Error('Missing required Robokassa parameters.')
    }

    const password_2 = Deno.env.get('ROBOKASSA_PASSWORD_2')
    if (!password_2) {
      throw new Error('ROBOKASSA_PASSWORD_2 is not set in environment variables.')
    }

    // 1. Validate the signature
    const signatureString = `${outSum}:${invId}:${password_2}:shp_org_id=${shp_org_id}:shp_tokens=${shp_tokens}`
    const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex').toLowerCase()

    if (expectedSignature !== signatureValue.toLowerCase()) {
      throw new Error('Invalid signature.')
    }

    // 2. Update the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update transaction status
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({ status: 'success', completed_at: new Date().toISOString() })
      .eq('id', invId)

    if (updateError) {
      throw new Error(`Failed to update transaction: ${updateError.message}`)
    }

    // Add tokens to the organization
    const { error: rpcError } = await supabaseClient.rpc('add_tokens_to_organization', {
      org_id: shp_org_id,
      token_amount: parseInt(shp_tokens, 10),
    })

    if (rpcError) {
      throw new Error(`Failed to add tokens: ${rpcError.message}`)
    }

    // Robokassa expects "OK" and the invoice ID in the response body
    return new Response(`OK${invId}`, { status: 200 })
  } catch (error) {
    console.error('Robokassa result error:', error.message)
    return new Response('Failed', { status: 400 })
  }
})

// Note: We need to create the `add_tokens_to_organization` RPC function in a new migration.
