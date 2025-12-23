import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ArrowLeft, User, Send, Loader2, Paperclip, X, ChevronDown } from 'lucide-react';
import { ChatMessage } from './';
import { markMessagesAsRead, resetUnreadCount } from '../api';
import type { ChatRoom, ChatMessage as ChatMessageType } from '../types';

interface ChatAreaProps {
  chatRoomId: string;
  userType: 'hr' | 'candidate';
  onBack?: () => void;
  initialChatRoom?: ChatRoom;
}

export const ChatArea = ({ chatRoomId, userType, onBack, initialChatRoom }: ChatAreaProps) => {
  const { t } = useTranslation('chat');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const isScrolledToBottomRef = useRef(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: chatRoom } = useQuery<any>({
    queryKey: ['chat-room', chatRoomId],
    queryFn: async () => {
      // If we are candidate, we can't fetch hr_specialist details due to RLS.
      // But we receive basic info in initialChatRoom from RPC.
      // So we just fetch the room to ensure it exists and get other fields.
      const query = supabase
        .from('chat_rooms')
        .select(`*, candidate:candidates(*, category:professional_categories(*))`)
        .eq('id', chatRoomId)
        .single();
      
      const { data, error } = await query;
      if (error) throw error;
      
      // If we are candidate, merge with initialChatRoom to get HR name
      if (userType === 'candidate' && initialChatRoom) {
        return {
          ...data,
          hr_specialist: initialChatRoom.hr_specialist
        };
      }
      
      // For HR, we need to fetch hr_specialist details as usual (or use initial)
      if (userType === 'hr') {
         const { data: hrData } = await supabase
          .from('hr_specialists')
          .select('*')
          .eq('id', data.hr_specialist_id)
          .single();
         return { ...data, hr_specialist: hrData };
      }

      return data;
    },
    initialData: initialChatRoom,
    enabled: !initialChatRoom // Only fetch if not provided (though RPC data might be partial)
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

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
    
    isScrolledToBottomRef.current = isBottom;
    setShowScrollButton(!isBottom);
  };

  useLayoutEffect(() => {
    if (isScrolledToBottomRef.current || (messages && messages[messages.length - 1]?.sender_id === user?.id)) {
      scrollToBottom(false); // Auto scroll on new messages if was at bottom or own message
    }
  }, [messages, user?.id]);

  // Initial scroll
  useEffect(() => {
    scrollToBottom(false);
  }, [chatRoomId]); // Reset scroll on room change

  useEffect(() => {
    if (!messages || !user || !chatRoomId) return;

    const unreadMessages = messages.filter(
      msg => msg.sender_id !== user.id && !msg.is_read
    );

    // Only mark as read if user is scrolled to bottom (looking at messages)
    if (unreadMessages.length > 0 && isScrolledToBottomRef.current) {
      markMessagesAsRead(unreadMessages.map(m => m.id));
      resetUnreadCount(chatRoomId, userType);
    }
  }, [messages, user, chatRoomId, userType, showScrollButton]); // Depend on showScrollButton to re-check when user scrolls down

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

    channelRef.current = channel;

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
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsOtherUserTyping(false), 3000); // Hide after 3s
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [chatRoomId, queryClient, user]);

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { is_typing: true },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading || !chatRoom) {
    return (
      <div className="h-full flex items-center justify-center bg-background/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p className="text-sm text-muted-foreground animate-pulse">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const otherPerson =
    userType === 'hr' ? chatRoom.candidate : chatRoom.hr_specialist;

  if (!otherPerson) return <div>Error loading chat details</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b px-4 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 shadow-sm h-[53px] flex items-center">
        <div className="flex items-center gap-3 w-full">
          {onBack && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-8 w-8 ring-1 ring-border/50">
              <AvatarImage src={otherPerson.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-xs">
                {otherPerson.full_name?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{otherPerson.full_name || 'User'}</h3>
              {isOtherUserTyping && (
                <p className="text-[10px] text-emerald-500 animate-pulse font-medium">
                  {t('typing')}
                </p>
              )}
            </div>
          </div>
          {userType === 'hr' && chatRoom?.candidate?.id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 px-2"
              onClick={() => {
                window.open(`/hr/candidate/${chatRoom.candidate.id}`, '_blank');
              }}
            >
              <User className="h-3.5 w-3.5" />
              {t('viewProfile')}
            </Button>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages?.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
          />
        ))}
      </div>

      {showScrollButton && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-24 right-6 h-8 w-8 rounded-full shadow-lg z-10 animate-in fade-in zoom-in duration-200 bg-muted/80 hover:bg-muted text-foreground border border-border/50 backdrop-blur-sm"
          onClick={() => scrollToBottom()}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      <div className="p-3 bg-background z-20">
        <div className="bg-muted/30 rounded-xl border p-1 ring-offset-background focus-within:ring-2 focus-within:ring-ring/20 transition-all">
          {selectedFile && (
            <div className="mx-2 mt-2 p-2 bg-background rounded-md border shadow-sm flex items-center justify-between">
              <span className="text-xs truncate max-w-[200px] text-muted-foreground">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-transparent"
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
              className="resize-none min-h-[36px] max-h-[120px] bg-transparent border-0 shadow-none focus-visible:ring-0 p-2 text-sm"
              disabled={isSending && !!selectedFile}
            />
            <Button
              onClick={handleSend}
              disabled={(!messageText.trim() && !selectedFile) || isSending}
              size="icon"
              className={cn(
                "h-8 w-8 flex-shrink-0 mb-0.5 mr-0.5 transition-all",
                (messageText.trim() || selectedFile) ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
              )}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="px-1 pt-0.5 pb-1">
          <p className="text-[10px] text-muted-foreground/50 text-right pr-2 select-none">
            {t('pressEnter')}
          </p>
        </div>
      </div>
    </div>
  );
};
