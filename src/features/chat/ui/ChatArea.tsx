import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, User, Send, Loader2 } from 'lucide-react';
import { ChatMessage } from './';
import { markMessagesAsRead, resetUnreadCount } from '../api';
import type { ChatRoom, ChatMessage as ChatMessageType } from '../types';

interface ChatAreaProps {
  chatRoomId: string;
  userType: 'hr' | 'candidate';
  onBack?: () => void;
}

export const ChatArea = ({ chatRoomId, userType, onBack }: ChatAreaProps) => {
  const { t } = useTranslation('chat');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const { data: chatRoom } = useQuery<ChatRoom>({
    queryKey: ['chat-room', chatRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(
          `*, hr_specialist:hr_specialists(*), candidate:candidates(*, category:professional_categories(*))`
        )
        .eq('id', chatRoomId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: messages, isLoading } = useQuery<ChatMessageType[]>({
    queryKey: ['chat-messages', chatRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!messages || !user || !chatRoomId) return;

    const unreadMessages = messages.filter(
      msg => msg.sender_id !== user.id && !msg.is_read
    );

    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages.map(m => m.id));
      resetUnreadCount(chatRoomId, userType);
    }
  }, [messages, user, chatRoomId, userType]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending || !user) return;

    try {
      setIsSending(true);
      const { error } = await supabase.from('chat_messages').insert({
        chat_room_id: chatRoomId,
        sender_id: user.id,
        sender_type: userType,
        message_text: messageText.trim(),
        is_read: false,
      });

      if (error) throw error;
      setMessageText('');
    } catch {
      toast.error(t('sendError'));
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`chat:${chatRoomId}`, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        payload => {
          queryClient.setQueryData(
            ['chat-messages', chatRoomId],
            (old: ChatMessageType[] | undefined) => [
              ...(old || []),
              payload.new as ChatMessageType,
            ]
          );
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.is_typing) {
          setIsOtherUserTyping(true);
          setTimeout(() => setIsOtherUserTyping(false), 3000); // Hide after 3s
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, queryClient, user]);

  const handleTyping = (text: string) => {
    setMessageText(text);
    const channel = supabase.channel(`chat:${chatRoomId}`);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    channel.track({ is_typing: true });
    typingTimeoutRef.current = setTimeout(() => {
      channel.track({ is_typing: false });
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading || !chatRoom) {
    return <div>{t('loading')}</div>;
  }

  const otherPerson =
    userType === 'hr' ? chatRoom.candidate : chatRoom.hr_specialist;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{otherPerson.full_name}</h3>
              {isOtherUserTyping && (
                <p className="text-xs text-emerald-500 animate-pulse">
                  {t('typing')}
                </p>
              )}
            </div>
          </div>
          {userType === 'hr' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(`/hr/candidate/${chatRoom.candidate.id}`, '_blank');
              }}
            >
              <User className="h-4 w-4 mr-2" />
              {t('viewProfile')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder={t('typePlaceholder')}
            value={messageText}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px]"
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            size="icon"
            className="flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('pressEnter')}
        </p>
      </div>
    </div>
  );
};
