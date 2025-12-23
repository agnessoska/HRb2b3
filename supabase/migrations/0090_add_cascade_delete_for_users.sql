-- Drop existing foreign keys
ALTER TABLE hr_specialists DROP CONSTRAINT IF EXISTS hr_specialists_user_id_fkey;
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_user_id_fkey;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_owner_id_fkey;

-- Recreate foreign keys with ON DELETE CASCADE
ALTER TABLE hr_specialists
  ADD CONSTRAINT hr_specialists_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE candidates
  ADD CONSTRAINT candidates_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE organizations
  ADD CONSTRAINT organizations_owner_id_fkey
  FOREIGN KEY (owner_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;