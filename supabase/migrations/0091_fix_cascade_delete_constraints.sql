-- Clean up orphaned records in chat_messages
DELETE FROM chat_messages 
WHERE sender_id NOT IN (SELECT id FROM auth.users);

-- Fix chat_messages sender_id (auth.users)
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Fix applications added_by_hr_id (hr_specialists)
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_added_by_hr_id_fkey;
ALTER TABLE applications
  ADD CONSTRAINT applications_added_by_hr_id_fkey
  FOREIGN KEY (added_by_hr_id)
  REFERENCES hr_specialists(id)
  ON DELETE SET NULL;

-- Fix generated_documents created_by_hr_id (hr_specialists)
ALTER TABLE generated_documents DROP CONSTRAINT IF EXISTS generated_documents_created_by_hr_id_fkey;
ALTER TABLE generated_documents
  ADD CONSTRAINT generated_documents_created_by_hr_id_fkey
  FOREIGN KEY (created_by_hr_id)
  REFERENCES hr_specialists(id)
  ON DELETE SET NULL;

-- Fix candidate_full_analysis created_by_hr_id (hr_specialists)
ALTER TABLE candidate_full_analysis DROP CONSTRAINT IF EXISTS candidate_full_analysis_created_by_hr_id_fkey;
ALTER TABLE candidate_full_analysis
  ADD CONSTRAINT candidate_full_analysis_created_by_hr_id_fkey
  FOREIGN KEY (created_by_hr_id)
  REFERENCES hr_specialists(id)
  ON DELETE SET NULL;

-- Fix candidate_comparisons created_by_hr_id (hr_specialists)
ALTER TABLE candidate_comparisons DROP CONSTRAINT IF EXISTS candidate_comparisons_created_by_hr_id_fkey;
ALTER TABLE candidate_comparisons
  ADD CONSTRAINT candidate_comparisons_created_by_hr_id_fkey
  FOREIGN KEY (created_by_hr_id)
  REFERENCES hr_specialists(id)
  ON DELETE SET NULL;

-- Fix resume_analysis_results created_by_hr_id (hr_specialists)
ALTER TABLE resume_analysis_results DROP CONSTRAINT IF EXISTS resume_analysis_results_created_by_hr_id_fkey;
ALTER TABLE resume_analysis_results
  ADD CONSTRAINT resume_analysis_results_created_by_hr_id_fkey
  FOREIGN KEY (created_by_hr_id)
  REFERENCES hr_specialists(id)
  ON DELETE SET NULL;

-- Clean up orphaned records in hr_invitation_tokens
DELETE FROM hr_invitation_tokens 
WHERE created_by NOT IN (SELECT id FROM auth.users);

DELETE FROM hr_invitation_tokens 
WHERE used_by NOT IN (SELECT id FROM auth.users) AND used_by IS NOT NULL;

-- Fix hr_invitation_tokens created_by and used_by (hr_specialists/auth.users)
-- created_by refers to hr_specialists(id) which is auth.users(id)
ALTER TABLE hr_invitation_tokens DROP CONSTRAINT IF EXISTS hr_invitation_tokens_created_by_fkey;
ALTER TABLE hr_invitation_tokens
  ADD CONSTRAINT hr_invitation_tokens_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

ALTER TABLE hr_invitation_tokens DROP CONSTRAINT IF EXISTS hr_invitation_tokens_used_by_fkey;
ALTER TABLE hr_invitation_tokens
  ADD CONSTRAINT hr_invitation_tokens_used_by_fkey
  FOREIGN KEY (used_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Fix resume_analysis_sessions (hr_specialists / organizations)
ALTER TABLE resume_analysis_sessions DROP CONSTRAINT IF EXISTS resume_analysis_sessions_created_by_hr_id_fkey;
ALTER TABLE resume_analysis_sessions
  ADD CONSTRAINT resume_analysis_sessions_created_by_hr_id_fkey
  FOREIGN KEY (created_by_hr_id)
  REFERENCES hr_specialists(id)
  ON DELETE SET NULL;

ALTER TABLE resume_analysis_sessions DROP CONSTRAINT IF EXISTS resume_analysis_sessions_organization_id_fkey;
ALTER TABLE resume_analysis_sessions
  ADD CONSTRAINT resume_analysis_sessions_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id)
  ON DELETE CASCADE;

-- Fix application_timeline hr_specialist_id (hr_specialists)
ALTER TABLE application_timeline DROP CONSTRAINT IF EXISTS application_timeline_hr_specialist_id_fkey;
ALTER TABLE application_timeline
  ADD CONSTRAINT application_timeline_hr_specialist_id_fkey
  FOREIGN KEY (hr_specialist_id)
  REFERENCES hr_specialists(id)
  ON DELETE SET NULL;