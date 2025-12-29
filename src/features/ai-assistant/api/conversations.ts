import { supabase } from '@/shared/lib/supabase';
import type { AIAssistantConversation, AIAssistantMessage, AIAssistantConversationInsert } from '../types';

export const getConversations = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('ai_assistant_conversations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as AIAssistantConversation[];
};

export const getConversationMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('ai_assistant_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as AIAssistantMessage[];
};

export const createConversation = async (payload: AIAssistantConversationInsert) => {
  const { data, error } = await supabase
    .from('ai_assistant_conversations')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as AIAssistantConversation;
};

export const deleteConversation = async (id: string) => {
  const { error } = await supabase
    .from('ai_assistant_conversations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const updateConversationTitle = async (id: string, title: string) => {
  const { error } = await supabase
    .from('ai_assistant_conversations')
    .update({ title })
    .eq('id', id);

  if (error) throw error;
};