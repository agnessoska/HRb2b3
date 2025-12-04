-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Policy for uploading resumes (HR only)
CREATE POLICY "HR can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid() IN (SELECT user_id FROM hr_specialists));

-- Policy for reading resumes (HR only)
CREATE POLICY "HR can read resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes' AND auth.uid() IN (SELECT user_id FROM hr_specialists));

-- Create resume_analysis_sessions table
CREATE TABLE IF NOT EXISTS resume_analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_by_hr_id UUID REFERENCES hr_specialists(id) NOT NULL,
  vacancy_ids UUID[] NOT NULL,
  total_files INTEGER NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed'))
);

-- RLS for sessions
ALTER TABLE resume_analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view own organization sessions"
ON resume_analysis_sessions FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can create sessions"
ON resume_analysis_sessions FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- Create candidate_analysis_results table
CREATE TABLE IF NOT EXISTS candidate_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES resume_analysis_sessions(id) ON DELETE CASCADE,
  candidate_name TEXT,
  match_score INTEGER,
  summary TEXT,
  pros TEXT[],
  cons TEXT[],
  verdict TEXT CHECK (verdict IN ('recommended', 'maybe', 'rejected')),
  vacancy_matches JSONB,
  raw_ai_response TEXT,
  file_path TEXT, -- Store the path to the file in storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for results
ALTER TABLE candidate_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view results via session"
ON candidate_analysis_results FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM resume_analysis_sessions
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "HR can insert results"
ON candidate_analysis_results FOR INSERT
TO authenticated
WITH CHECK (
  session_id IN (
    SELECT id FROM resume_analysis_sessions
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);
