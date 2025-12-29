import type { Database } from '@/shared/types/database';

export type AIAssistantConversation = Database['public']['Tables']['ai_assistant_conversations']['Row'];
export type AIAssistantMessage = Database['public']['Tables']['ai_assistant_messages']['Row'];
export type AIAssistantConversationInsert = Database['public']['Tables']['ai_assistant_conversations']['Insert'];
export type AIAssistantMessageInsert = Database['public']['Tables']['ai_assistant_messages']['Insert'];

export type ContextType = 'global' | 'vacancy' | 'candidate';

export interface SendMessagePayload {
  organization_id: string;
  hr_specialist_id: string;
  conversation_id?: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context_type?: ContextType;
  context_entity_id?: string;
  language?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
}

export interface AIAssistantStreamDelta {
  text?: string;
  error?: string;
}