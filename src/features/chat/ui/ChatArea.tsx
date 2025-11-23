import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, User, Send, Loader2, Paperclip, X } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(t('fileTooLarge'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = async () => {
    if ((!messageText.trim() && !selectedFile) || isSending || !user) return;

    try {
      setIsSending(true);
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${chatRoomId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        attachmentUrl = publicUrl;
        attachmentType = selectedFile.type;
        attachmentName = selectedFile.name;
      }

      const { error } = await supabase.from('chat_messages').insert({
        chat_room_id: chatRoomId,
        sender_id: user.id,
        sender_type: userType,
        message_text: messageText.trim(),
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
        is_read: false,
      });

      if (error) throw error;
      setMessageText('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Send error:', error);
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        payload => {
          queryClient.setQueryData(
            ['chat-messages', chatRoomId],
            (old: ChatMessageType[] | undefined) =>
              old?.map(msg =>
                msg.id === (payload.new as ChatMessageType).id
                  ? (payload.new as ChatMessageType)
                  : msg
              ) || []
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
        {selectedFile && (
          <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
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
            disabled={(!messageText.trim() && !selectedFile) || isSending}
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
