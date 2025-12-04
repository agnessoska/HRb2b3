-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Policy for uploading resumes (HR only)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'HR can upload resumes'
    ) THEN
        CREATE POLICY "HR can upload resumes"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'resumes' AND auth.uid() IN (SELECT user_id FROM hr_specialists));
    END IF;
END
$$;

-- Policy for reading resumes (HR only)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'HR can read resumes'
    ) THEN
        CREATE POLICY "HR can read resumes"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'resumes' AND auth.uid() IN (SELECT user_id FROM hr_specialists));
    END IF;
END
$$;

-- Add file_paths column to resume_analysis_results
ALTER TABLE resume_analysis_results 
ADD COLUMN IF NOT EXISTS file_paths TEXT[];
