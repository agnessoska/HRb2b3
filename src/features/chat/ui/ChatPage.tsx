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
      const query = supabase
        .from('chat_rooms')
        .select(
          `
          *,
          hr_specialist:hr_specialists(*),
          candidate:candidates(*, category:professional_categories(*))
        `
        )
        .order('last_message_at', { ascending: false });

      if (userType === 'hr') {
        query.eq('hr_specialist_id', profileId);
      } else {
        query.eq('candidate_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('chat-rooms-update')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
          filter:
            userType === 'hr'
              ? `hr_specialist_id=eq.${profileId}`
              : `candidate_id=eq.${profileId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['chat-rooms', userType, profileId],
          });
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
    return chatRooms.find(room =>
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
      <div className="h-full flex flex-col">
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
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="w-[30%] border-r flex flex-col">
        <ChatList
          chatRooms={chatRooms || []}
          userType={userType}
          activeChatRoomId={activeChatRoomId}
          onChatSelect={handleChatSelect}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {activeChatRoomId ? (
          <ChatArea key={activeChatRoomId} chatRoomId={activeChatRoomId} userType={userType} />
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
};
