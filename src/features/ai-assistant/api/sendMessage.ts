import { supabase } from '@/shared/lib/supabase';
import type { SendMessagePayload, AIAssistantStreamDelta } from '../types';

export const sendMessageStream = async (
  payload: SendMessagePayload,
  onDelta: (delta: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const decoder = new TextDecoder();
    let isDone = false;
    let buffer = '';

    while (!isDone) {
      const { done, value } = await reader.read();
      if (done) {
        isDone = true;
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          
          if (dataStr === '[DONE]') {
            isDone = true;
            onComplete();
            break;
          }

          try {
            const data: AIAssistantStreamDelta = JSON.parse(dataStr);
            if (data.error) {
              onError(data.error);
              isDone = true;
              break;
            }
            if (data.text) {
              onDelta(data.text);
            }
          } catch (e) {
            console.warn('Error parsing stream chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    onError(message);
  }
};