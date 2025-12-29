import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  ChatList,
  ChatArea,
  EmptyChatState,
  ChatSkeleton,
} from './';

interface ChatPageProps {
  userType: 'hr' | 'candidate';
}

export const ChatPage = ({ userType }: ChatPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const selectedChatId = searchParams.get(
    userType === 'hr' ? 'candidateId' : 'hrId'
  );

  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch profile to get the correct ID for chat rooms
  const { data: hrProfile } = useQuery({
    queryKey: ['hrProfile', user?.id],
    queryFn: async () => {
      if (!user || userType !== 'hr') return null;
      const { data } = await supabase
        .from('hr_specialists')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user && userType === 'hr',
  });

  const { data: candidateProfile } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: async () => {
      if (!user || userType !== 'candidate') return null;
      const { data } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user && userType === 'candidate',
  });

  const profileId = userType === 'hr' ? hrProfile?.id : candidateProfile?.id;

  const { data: chatRooms, isLoading } = useQuery({
    queryKey: ['chat-rooms', userType, profileId],
    queryFn: async () => {
      if (!profileId) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase.rpc('get_my_chat_rooms' as any);
      
      if (error) throw error;
      
      // Adapt RPC result to match ChatRoom type for compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data as any[]) || []).map((room: any) => ({
        id: room.id,
        created_at: room.created_at,
        last_message_at: room.last_message_at,
        organization_id: '',
        hr_specialist_id: '',
        candidate_id: '',
        unread_count_hr: userType === 'hr' ? room.unread_count : 0,
        unread_count_candidate: userType === 'candidate' ? room.unread_count : 0,
        hr_specialist: userType === 'candidate' ? { full_name: room.other_user_name, id: room.other_user_id, avatar_url: room.other_user_avatar_url } : {},
        candidate: userType === 'hr' ? {
          full_name: room.other_user_name,
          id: room.other_user_id,
          avatar_url: room.other_user_avatar_url,
          category: room.other_user_category ? { name_ru: room.other_user_category, name_en: room.other_user_category, name_kk: room.other_user_category } : null
        } : {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;
    },
    enabled: !!profileId,
  });

  useEffect(() => {
    if (!user || !profileId) return;

    const channel = supabase
      .channel(`chat-rooms-sync-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown>;
          const oldRow = payload.old as Record<string, unknown>;
          
          // Проверяем, относится ли изменение к текущему пользователю
          const isRelevant = 
            (newRow && (newRow.hr_specialist_id === profileId || newRow.candidate_id === profileId)) ||
            (oldRow && (oldRow.hr_specialist_id === profileId || oldRow.candidate_id === profileId));

          if (isRelevant) {
            queryClient.invalidateQueries({
              queryKey: ['chat-rooms', userType, profileId],
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          const newMessage = payload.new as Record<string, unknown>;
          
          // Проверяем принадлежность сообщения пользователю через комнату чата
          const { data: room } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('id', newMessage.chat_room_id as string)
            .or(`hr_specialist_id.eq.${profileId},candidate_id.eq.${profileId}`)
            .single();

          if (room) {
            queryClient.invalidateQueries({
              queryKey: ['chat-rooms', userType, profileId],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userType, queryClient, profileId]);

  const handleChatSelect = (_chatRoomId: string, otherUserId: string) => {
    const param = userType === 'hr' ? 'candidateId' : 'hrId';
    setSearchParams({ [param]: otherUserId });
  };

  const handleBackToList = () => {
    navigate(userType === 'hr' ? '/hr/chat' : '/candidate/chat');
  };

  const activeChatRoom = useMemo(() => {
    if (!selectedChatId || !chatRooms) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (chatRooms as any[]).find((room: any) =>
      userType === 'hr'
        ? room.candidate.id === selectedChatId
        : room.hr_specialist.id === selectedChatId
    );
  }, [selectedChatId, chatRooms, userType]);

  const activeChatRoomId = activeChatRoom?.id ?? null;
  const showChatArea = isMobileView && activeChatRoomId;

  if (isLoading) {
    return <ChatSkeleton />;
  }

  if (isMobileView) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col border rounded-xl overflow-hidden bg-background shadow-sm">
        {!showChatArea ? (
          <ChatList
            chatRooms={chatRooms || []}
            userType={userType}
            activeChatRoomId={activeChatRoomId}
            onChatSelect={handleChatSelect}
          />
        ) : (
          <ChatArea
            key={activeChatRoomId}
            chatRoomId={activeChatRoomId!}
            userType={userType}
            onBack={handleBackToList}
            initialChatRoom={activeChatRoom}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8.5rem)] flex border rounded-xl overflow-hidden bg-background shadow-sm ring-1 ring-border/50 isolate">
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <ChatList
          chatRooms={chatRooms || []}
          userType={userType}
          activeChatRoomId={activeChatRoomId}
          onChatSelect={handleChatSelect}
        />
      </div>

      <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm">
        {activeChatRoomId ? (
          <ChatArea
            key={activeChatRoomId}
            chatRoomId={activeChatRoomId}
            userType={userType}
            initialChatRoom={activeChatRoom}
          />
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
};
