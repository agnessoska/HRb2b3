-- Индексы для organizations
CREATE INDEX ON organizations (owner_id);

-- Индексы для hr_specialists
CREATE INDEX ON hr_specialists (user_id);
CREATE INDEX ON hr_specialists (organization_id);

-- Индексы для candidates
CREATE INDEX ON candidates (user_id);
CREATE INDEX ON candidates (category_id);
CREATE INDEX ON candidates (invited_by_organization_id);
CREATE INDEX ON candidates (is_public);

-- Индексы для candidate_skills
CREATE INDEX ON candidate_skills (canonical_skill);

-- Индексы для skills_dictionary
CREATE INDEX ON skills_dictionary (canonical_name);
CREATE INDEX ON skills_dictionary USING GIN (name gin_trgm_ops);
CREATE INDEX ON skills_dictionary (canonical_name, language);

-- Индексы для invitation_tokens
CREATE INDEX ON invitation_tokens (organization_id);
CREATE INDEX ON invitation_tokens (created_by_hr_id);

-- Индексы для vacancies
CREATE INDEX ON vacancies (organization_id);
CREATE INDEX ON vacancies (status);
CREATE INDEX ON vacancies (created_by_hr_id);

-- Индексы для vacancy_skills
CREATE INDEX ON vacancy_skills (vacancy_id);

-- Индексы для applications
CREATE INDEX ON applications (organization_id);
CREATE INDEX ON applications (vacancy_id);
CREATE INDEX ON applications (status);

-- Индексы для test_questions
CREATE INDEX ON test_questions (test_id);

-- Индексы для candidate_test_results
CREATE INDEX ON candidate_test_results (candidate_id);
CREATE INDEX ON candidate_test_results (test_id);

-- Индексы для ai_prompts
CREATE INDEX ON ai_prompts (operation_type);
CREATE INDEX ON ai_prompts (is_active);

-- Индексы для ai_models
CREATE INDEX ON ai_models (operation_type, is_active);

-- Индексы для ai_operations_log
CREATE INDEX ON ai_operations_log (organization_id);
CREATE INDEX ON ai_operations_log (created_at);
CREATE INDEX ON ai_operations_log (operation_type);

-- Индексы для generated_documents
CREATE INDEX ON generated_documents (organization_id);
CREATE INDEX ON generated_documents (candidate_id);
CREATE INDEX ON generated_documents (created_by_hr_id);

-- Индексы для candidate_full_analysis
CREATE INDEX ON candidate_full_analysis (candidate_id);

-- Индексы для candidate_comparisons
CREATE INDEX ON candidate_comparisons (organization_id);
CREATE INDEX ON candidate_comparisons (vacancy_id);

-- Индексы для resume_analysis_results
CREATE INDEX ON resume_analysis_results (organization_id);
CREATE INDEX ON resume_analysis_results (created_by_hr_id);
CREATE INDEX ON resume_analysis_results (created_at);

-- Индексы для chat_rooms
CREATE INDEX ON chat_rooms (organization_id);
CREATE INDEX ON chat_rooms (last_message_at);

-- Индексы для chat_messages
CREATE INDEX ON chat_messages (chat_room_id);
CREATE INDEX ON chat_messages (created_at);
CREATE INDEX ON chat_messages (is_read);

-- Индексы для payment_transactions
CREATE INDEX ON payment_transactions (organization_id);
CREATE INDEX ON payment_transactions (robokassa_invoice_id);
CREATE INDEX ON payment_transactions (status);
