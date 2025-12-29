-- RPC function to get all operation costs and AI limits for the UI
CREATE OR REPLACE FUNCTION public.get_ai_operation_configs()
RETURNS TABLE (
    operation_type text,
    is_ai boolean,
    fixed_cost integer,
    max_output_tokens integer,
    model_name text,
    provider text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH all_ops AS (
        -- Get fixed costs
        SELECT 
            tc.operation_type, 
            false as is_ai, 
            tc.cost_tokens as fixed_cost,
            NULL::integer as max_output_tokens,
            NULL::text as model_name,
            NULL::text as provider
        FROM token_costs tc
        WHERE tc.is_active = true
        
        UNION ALL
        
        -- Get AI limits
        SELECT 
            am.operation_type, 
            true as is_ai, 
            NULL::integer as fixed_cost,
            am.max_output_tokens,
            am.model_name,
            am.provider
        FROM ai_models am
        WHERE am.is_active = true
    )
    SELECT * FROM all_ops;
END;
$$;