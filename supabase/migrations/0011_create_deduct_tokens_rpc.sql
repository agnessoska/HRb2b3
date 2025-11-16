CREATE OR REPLACE FUNCTION public.deduct_tokens(org_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.organizations
  SET token_balance = token_balance - amount
  WHERE id = org_id;
END;
$$;
