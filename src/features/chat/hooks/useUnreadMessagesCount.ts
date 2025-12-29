import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/app/store/auth';

export const useUnreadMessagesCount = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [profileId, setProfileId] = useState<string | null>(null);

  // Сначала получаем ID профиля, так как счетчики в chat_rooms привязаны к нему (id профиля может отличаться от user_id)
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user?.id) return;
      const role = user.user_metadata?.role;
      
      const table = role === 'hr' ? 'hr_specialists' : 'candidates';
      const { data } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data) setProfileId(data.id);
    };

    fetchProfileId();
  }, [user]);

  const { data: count = 0 } = useQuery({
    queryKey: ['unreadMessagesCount', profileId],
    queryFn: async () => {
      if (!profileId) return 0;
      
      const { data, error } = await supabase.rpc('get_total_unread_messages', {
        p_user_id: profileId,
      });

      if (error) {
        console.error('Error fetching unread messages count:', error);
        return 0;
      }

      return data as number;
    },
    enabled: !!profileId,
  });

  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`unread-global-${profileId}`)
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
          
          const isRelevant = 
            (newRow && (newRow.hr_specialist_id === profileId || newRow.candidate_id === profileId)) ||
            (oldRow && (oldRow.hr_specialist_id === profileId || oldRow.candidate_id === profileId));

          if (isRelevant) {
            queryClient.invalidateQueries({ queryKey: ['unreadMessagesCount', profileId] });
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
            queryClient.invalidateQueries({ queryKey: ['unreadMessagesCount', profileId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, queryClient]);

  return { count };
};
