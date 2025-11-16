-- Rename max_tokens to max_output_tokens for clarity
ALTER TABLE public.ai_models
RENAME COLUMN max_tokens TO max_output_tokens;

-- Add a nullable integer column for the thinking budget
ALTER TABLE public.ai_models
ADD COLUMN thinking_budget INTEGER;

-- Add comments to the new columns for documentation
COMMENT ON COLUMN public.ai_models.max_output_tokens IS 'The maximum number of tokens to generate in the final response.';
COMMENT ON COLUMN public.ai_models.thinking_budget IS 'The maximum number of tokens the model can use for its internal thinking process. Null or 0 disables it.';

-- Backfill existing rows with a default thinking_budget of null
UPDATE public.ai_models
SET thinking_budget = NULL;
