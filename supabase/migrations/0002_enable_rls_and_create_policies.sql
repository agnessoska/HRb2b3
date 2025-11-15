-- Включаем RLS для всех таблиц
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancy_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_operations_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_full_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Политики для organizations
CREATE POLICY "organization_members_can_view_own_org" ON organizations FOR SELECT TO authenticated USING (id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "organization_owner_can_update" ON organizations FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Политики для hr_specialists
CREATE POLICY "hr_can_view_colleagues" ON hr_specialists FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_update_own_profile" ON hr_specialists FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Политики для professional_categories
CREATE POLICY "categories_public_read" ON professional_categories FOR SELECT TO authenticated, anon USING (true);

-- Политики для candidates
CREATE POLICY "candidates_can_view_own_profile" ON candidates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "candidates_can_update_own_profile" ON candidates FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "hr_can_view_organization_candidates" ON candidates FOR SELECT TO authenticated USING (invited_by_organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()) OR id IN (SELECT candidate_id FROM applications WHERE organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid())));
CREATE POLICY "hr_can_view_public_candidates" ON candidates FOR SELECT TO authenticated USING (is_public = true AND EXISTS (SELECT 1 FROM hr_specialists WHERE user_id = auth.uid()));

-- Политики для candidate_skills
CREATE POLICY "candidates_manage_own_skills" ON candidate_skills FOR ALL TO authenticated USING (candidate_id = auth.uid());
CREATE POLICY "hr_can_view_candidate_skills" ON candidate_skills FOR SELECT TO authenticated USING (candidate_id IN (SELECT id FROM candidates WHERE invited_by_organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()) OR id IN (SELECT candidate_id FROM applications WHERE organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()))));

-- Политики для skills_dictionary
CREATE POLICY "skills_dictionary_public_read" ON skills_dictionary FOR SELECT TO authenticated, anon USING (true);

-- Политики для invitation_tokens
CREATE POLICY "hr_can_view_organization_tokens" ON invitation_tokens FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_create_tokens" ON invitation_tokens FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "public_can_validate_tokens" ON invitation_tokens FOR SELECT TO anon USING (true);

-- Политики для vacancies
CREATE POLICY "hr_can_view_organization_vacancies" ON vacancies FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_create_vacancies" ON vacancies FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_update_organization_vacancies" ON vacancies FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid())) WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));

-- Политики для vacancy_skills
CREATE POLICY "hr_can_manage_vacancy_skills" ON vacancy_skills FOR ALL TO authenticated USING (vacancy_id IN (SELECT id FROM vacancies WHERE organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid())));

-- Политики для applications
CREATE POLICY "hr_can_view_organization_applications" ON applications FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_create_applications" ON applications FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_update_applications" ON applications FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "candidates_can_view_own_applications" ON applications FOR SELECT TO authenticated USING (candidate_id = auth.uid());

-- Политики для tests
CREATE POLICY "tests_public_read" ON tests FOR SELECT TO authenticated, anon USING (is_active = true);

-- Политики для test_scales
CREATE POLICY "test_scales_public_read" ON test_scales FOR SELECT TO authenticated, anon USING (true);

-- Политики для test_questions
CREATE POLICY "test_questions_public_read" ON test_questions FOR SELECT TO authenticated, anon USING (true);

-- Политики для candidate_test_results
CREATE POLICY "candidates_can_view_own_results" ON candidate_test_results FOR SELECT TO authenticated USING (candidate_id = auth.uid());
CREATE POLICY "candidates_can_create_own_results" ON candidate_test_results FOR INSERT TO authenticated WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "hr_can_view_candidate_results" ON candidate_test_results FOR SELECT TO authenticated USING (candidate_id IN (SELECT id FROM candidates WHERE invited_by_organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()) OR id IN (SELECT candidate_id FROM applications WHERE organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()))));

-- Политики для token_costs
CREATE POLICY "token_costs_public_read" ON token_costs FOR SELECT TO authenticated USING (is_active = true);

-- Политики для ai_operations_log
CREATE POLICY "org_owner_can_view_operations_log" ON ai_operations_log FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid() AND role = 'owner'));

-- Политики для generated_documents
CREATE POLICY "hr_can_view_organization_documents" ON generated_documents FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_create_documents" ON generated_documents FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_update_documents" ON generated_documents FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "public_documents_readable" ON generated_documents FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "candidates_can_view_own_documents" ON generated_documents FOR SELECT TO authenticated USING (candidate_id = auth.uid());

-- Политики для candidate_full_analysis
CREATE POLICY "hr_can_view_organization_analysis" ON candidate_full_analysis FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_create_analysis" ON candidate_full_analysis FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_update_analysis" ON candidate_full_analysis FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "public_analysis_readable" ON candidate_full_analysis FOR SELECT TO anon USING (is_public = true);

-- Политики для candidate_comparisons
CREATE POLICY "hr_can_view_organization_comparisons" ON candidate_comparisons FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_create_comparisons" ON candidate_comparisons FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));

-- Политики для resume_analysis_results
CREATE POLICY "hr_can_view_organization_resume_analysis" ON resume_analysis_results FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));
CREATE POLICY "hr_can_create_resume_analysis" ON resume_analysis_results FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()));

-- Политики для chat_rooms
CREATE POLICY "hr_can_view_own_chats" ON chat_rooms FOR SELECT TO authenticated USING (hr_specialist_id = auth.uid());
CREATE POLICY "candidates_can_view_own_chats" ON chat_rooms FOR SELECT TO authenticated USING (candidate_id = auth.uid());
CREATE POLICY "hr_can_create_chats" ON chat_rooms FOR INSERT TO authenticated WITH CHECK (hr_specialist_id = auth.uid());

-- Политики для chat_messages
CREATE POLICY "chat_participants_can_view_messages" ON chat_messages FOR SELECT TO authenticated USING (chat_room_id IN (SELECT id FROM chat_rooms WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()));
CREATE POLICY "chat_participants_can_send_messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (chat_room_id IN (SELECT id FROM chat_rooms WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()) AND sender_id = auth.uid());
CREATE POLICY "chat_participants_can_update_read_status" ON chat_messages FOR UPDATE TO authenticated USING (chat_room_id IN (SELECT id FROM chat_rooms WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()));

-- Политики для payment_transactions
CREATE POLICY "org_owner_can_view_transactions" ON payment_transactions FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid() AND role = 'owner'));
