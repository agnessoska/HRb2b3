-- 1. Создание таблицы ai_assistant_conversations
CREATE TABLE IF NOT EXISTS ai_assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hr_specialist_id uuid NOT NULL REFERENCES hr_specialists(id) ON DELETE CASCADE,
  title text,
  context_type text NOT NULL CHECK (context_type IN ('global', 'vacancy', 'candidate')),
  context_entity_id uuid
);

-- 2. Создание таблицы ai_assistant_messages
CREATE TABLE IF NOT EXISTS ai_assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  conversation_id uuid NOT NULL REFERENCES ai_assistant_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tokens_used integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- 3. Включение RLS
ALTER TABLE ai_assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;

-- 4. Политики для ai_assistant_conversations
CREATE POLICY "hr_can_view_own_org_conversations" 
ON ai_assistant_conversations FOR SELECT 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "hr_can_insert_own_conversations" 
ON ai_assistant_conversations FOR INSERT 
TO authenticated 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "hr_can_update_own_org_conversations" 
ON ai_assistant_conversations FOR UPDATE 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "hr_can_delete_own_org_conversations" 
ON ai_assistant_conversations FOR DELETE 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid()
  )
);

-- 5. Политики для ai_assistant_messages
CREATE POLICY "hr_can_view_own_org_messages" 
ON ai_assistant_messages FOR SELECT 
TO authenticated 
USING (
  conversation_id IN (
    SELECT id FROM ai_assistant_conversations 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "hr_can_insert_own_org_messages" 
ON ai_assistant_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  conversation_id IN (
    SELECT id FROM ai_assistant_conversations 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists 
      WHERE user_id = auth.uid()
    )
  )
);

-- 6. Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_ai_assistant_conv_org ON ai_assistant_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_conv_hr ON ai_assistant_conversations(hr_specialist_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_msg_conv ON ai_assistant_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_msg_created ON ai_assistant_messages(created_at);

-- 7. Триггер для обновления updated_at в ai_assistant_conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_assistant_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_conversation_timestamp
AFTER INSERT ON ai_assistant_messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();
