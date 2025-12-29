import { create } from 'zustand';
import type { AIAssistantMessage } from '../types';

interface AIAssistantState {
  currentConversationId: string | null;
  messages: AIAssistantMessage[];
  isStreaming: boolean;
  streamingText: string;
  isLoadingMessages: boolean;
  isProcessingMessage: boolean;
  
  setCurrentConversation: (id: string | null) => void;
  setMessages: (messages: AIAssistantMessage[]) => void;
  addMessage: (message: AIAssistantMessage) => void;
  setStreaming: (isStreaming: boolean) => void;
  setStreamingText: (text: string) => void;
  appendStreamingText: (text: string) => void;
  setIsLoadingMessages: (isLoading: boolean) => void;
  setIsProcessingMessage: (isProcessing: boolean) => void;
  reset: () => void;
}

export const useAIAssistantStore = create<AIAssistantState>((set) => ({
  currentConversationId: null,
  messages: [],
  isStreaming: false,
  streamingText: '',
  isLoadingMessages: false,
  isProcessingMessage: false,

  setCurrentConversation: (id) => set((state) => ({
    currentConversationId: id,
    // Only clear messages if we are actually switching between two different non-null conversations
    // If we are moving from null to a new ID (first message), keep the local messages
    messages: (state.currentConversationId && id && state.currentConversationId !== id) ? [] : state.messages,
    streamingText: '',
    isStreaming: false
  })),
  setMessages: (newMessages) => set((state) => {
    // Prevent overwriting messages with an empty array if we are currently
    // processing a new message and already have local messages.
    // This avoids the race condition where loadMessages from an effect
    // finishes before the server has saved the new message.
    if (state.isProcessingMessage && newMessages.length === 0 && state.messages.length > 0) {
      return state;
    }
    return { messages: newMessages };
  }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingText: (streamingText) => set({ streamingText }),
  appendStreamingText: (text) => set((state) => ({ streamingText: state.streamingText + text })),
  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setIsProcessingMessage: (isProcessingMessage) => set({ isProcessingMessage }),
  reset: () => set({
    currentConversationId: null,
    messages: [],
    isStreaming: false,
    streamingText: '',
    isLoadingMessages: false,
    isProcessingMessage: false
  }),
}));