-- Add attachment support to AI Assistant messages

-- 1. Add column to ai_assistant_messages
ALTER TABLE public.ai_assistant_messages 
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS attachment_name text,
ADD COLUMN IF NOT EXISTS attachment_type text;

-- 2. Create storage bucket for assistant attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ai-assistant-attachments', 'ai-assistant-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
CREATE POLICY "hr_can_upload_assistant_attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ai-assistant-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM hr_specialists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "hr_can_view_org_assistant_attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ai-assistant-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM hr_specialists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "hr_can_delete_own_org_assistant_attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ai-assistant-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM hr_specialists WHERE user_id = auth.uid()
  )
);