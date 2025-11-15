-- 3.2.1 Таблица: organizations
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  brand_logo_url text,
  token_balance integer NOT NULL DEFAULT 0,
  owner_id uuid NOT NULL REFERENCES auth.users(id)
);

-- 3.2.2 Таблица: hr_specialists
CREATE TABLE hr_specialists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) UNIQUE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text,
  role text NOT NULL CHECK (role IN ('owner', 'member')),
  is_active boolean NOT NULL DEFAULT true
);

-- 3.2.3 Таблица: professional_categories
CREATE TABLE professional_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ru text NOT NULL,
  name_kk text NOT NULL,
  name_en text NOT NULL,
  sort_order integer
);

-- 3.2.4 Таблица: candidates
CREATE TABLE candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  full_name text,
  phone text,
  category_id uuid REFERENCES professional_categories(id),
  experience text,
  education text,
  about text,
  tests_completed integer NOT NULL DEFAULT 0,
  tests_last_updated_at timestamptz,
  is_public boolean NOT NULL DEFAULT false,
  invited_by_hr_id uuid REFERENCES hr_specialists(id) ON DELETE SET NULL,
  invited_by_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL
);

-- 3.2.5 Таблица: candidate_skills
CREATE TABLE candidate_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  canonical_skill text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, canonical_skill)
);

-- 3.2.6 Таблица: skills_dictionary
CREATE TABLE skills_dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  canonical_name text NOT NULL,
  language text NOT NULL,
  category text
);

-- 3.2.7 Таблица: invitation_tokens
CREATE TABLE invitation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_hr_id uuid NOT NULL REFERENCES hr_specialists(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  used_by_candidate_id uuid REFERENCES candidates(id) ON DELETE SET NULL,
  expires_at timestamptz
);

-- 3.2.8 Таблица: vacancies
CREATE TABLE vacancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_hr_id uuid NOT NULL REFERENCES hr_specialists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  requirements text,
  salary_min integer,
  salary_max integer,
  location text,
  employment_type text,
  ideal_profile jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  funnel_counts jsonb
);

-- 3.2.9 Таблица: vacancy_skills
CREATE TABLE vacancy_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id uuid NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  canonical_skill text NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vacancy_id, canonical_skill)
);

-- 3.2.10 Таблица: applications
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  vacancy_id uuid NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL,
  added_by_hr_id uuid NOT NULL REFERENCES hr_specialists(id),
  compatibility_score integer,
  UNIQUE(candidate_id, vacancy_id)
);

-- 3.3.1 Таблица: tests
CREATE TABLE tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ru text NOT NULL,
  name_kk text NOT NULL,
  name_en text NOT NULL,
  description_ru text,
  description_kk text,
  description_en text,
  test_type text NOT NULL,
  total_questions integer,
  time_limit_minutes integer,
  sort_order integer,
  is_active boolean NOT NULL DEFAULT true
);

-- 3.3.2 Таблица: test_scales
CREATE TABLE test_scales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  code text NOT NULL,
  name_ru text NOT NULL,
  name_kk text NOT NULL,
  name_en text NOT NULL,
  description_ru text,
  description_kk text,
  description_en text,
  min_value integer,
  max_value integer,
  optimal_value integer,
  scale_type text,
  sort_order integer,
  UNIQUE(test_id, code)
);

-- 3.3.3 Таблица: test_questions
CREATE TABLE test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  text_ru text NOT NULL,
  text_kk text NOT NULL,
  text_en text NOT NULL,
  scale_code text,
  reverse_scored boolean NOT NULL DEFAULT false,
  options jsonb,
  UNIQUE(test_id, question_number)
);

-- 3.3.4 Таблица: candidate_test_results
CREATE TABLE candidate_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  answers jsonb,
  raw_scores jsonb,
  normalized_scores jsonb,
  detailed_result text,
  retake_available_at timestamptz,
  UNIQUE(candidate_id, test_id)
);

-- 3.3.5 Таблица: ai_prompts
CREATE TABLE ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  version text NOT NULL,
  prompt_text text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  UNIQUE(operation_type, version)
);

-- 3.3.6 Таблица: ai_models
CREATE TABLE ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  provider text NOT NULL,
  model_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  max_tokens integer,
  temperature numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.3.7 Таблица: token_costs
CREATE TABLE token_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL UNIQUE,
  cost_tokens integer NOT NULL,
  description_ru text,
  description_kk text,
  description_en text,
  is_active boolean NOT NULL DEFAULT true
);

-- 3.3.8 Таблица: ai_operations_log
CREATE TABLE ai_operations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hr_specialist_id uuid NOT NULL REFERENCES hr_specialists(id) ON DELETE CASCADE,
  operation_type text NOT NULL,
  model_used text,
  prompt_version text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  success boolean NOT NULL,
  error_message text,
  metadata jsonb
);

-- 3.3.9 Таблица: generated_documents
CREATE TABLE generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  vacancy_id uuid REFERENCES vacancies(id) ON DELETE SET NULL,
  created_by_hr_id uuid NOT NULL REFERENCES hr_specialists(id),
  document_type text NOT NULL,
  title text,
  content_markdown text,
  content_html text,
  is_public boolean NOT NULL DEFAULT false
);

-- 3.3.10 Таблица: candidate_full_analysis
CREATE TABLE candidate_full_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  vacancy_ids uuid[],
  created_by_hr_id uuid NOT NULL REFERENCES hr_specialists(id),
  content_markdown text,
  content_html text,
  is_public boolean NOT NULL DEFAULT false,
  UNIQUE(organization_id, candidate_id)
);

-- 3.3.11 Таблица: candidate_comparisons
CREATE TABLE candidate_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vacancy_id uuid NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  created_by_hr_id uuid NOT NULL REFERENCES hr_specialists(id),
  candidate_ids uuid[] NOT NULL,
  content_markdown text,
  content_html text,
  ranking jsonb
);

-- 3.3.12 Таблица: resume_analysis_results
CREATE TABLE resume_analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_hr_id uuid NOT NULL REFERENCES hr_specialists(id),
  vacancy_ids uuid[],
  resume_count integer,
  content_markdown text,
  content_html text
);

-- 3.3.13 Таблица: chat_rooms
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hr_specialist_id uuid NOT NULL REFERENCES hr_specialists(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  last_message_at timestamptz,
  unread_count_hr integer NOT NULL DEFAULT 0,
  unread_count_candidate integer NOT NULL DEFAULT 0,
  UNIQUE(hr_specialist_id, candidate_id)
);

-- 3.3.14 Таблица: chat_messages
CREATE TABLE chat_messages (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  chat_room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  sender_type text NOT NULL,
  message_text text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz
);

-- 3.3.15 Таблица: payment_transactions
CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  tokens_amount integer NOT NULL,
  status text NOT NULL,
  robokassa_invoice_id text,
  robokassa_data jsonb,
  completed_at timestamptz
);
