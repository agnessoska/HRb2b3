CREATE OR REPLACE FUNCTION public.add_tokens_to_organization(
  org_id uuid,
  token_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.organizations
  SET token_balance = token_balance + token_amount
  WHERE id = org_id;
END;
$$;
