-- Create a storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users (HR) to upload logos
CREATE POLICY "Authenticated users can upload brand logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-logos');

-- Policy to allow authenticated users (HR) to update their logos
CREATE POLICY "Authenticated users can update brand logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-logos');

-- Policy to allow public read access to brand logos (for invitations)
CREATE POLICY "Public read access to brand logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-logos');

-- Policy to allow authenticated users to delete their logos
CREATE POLICY "Authenticated users can delete brand logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-logos');