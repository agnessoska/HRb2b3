-- Add culture_description column to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS culture_description text;

-- Add comment to the column
COMMENT ON COLUMN public.organizations.culture_description IS 'Description of the organization culture and values for AI analysis';