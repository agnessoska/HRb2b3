import { supabase } from '@/shared/lib/supabase';

export const markMessagesAsRead = async (messageIds: number[]) => {
  if (messageIds.length === 0) return;

  const { error } = await supabase
    .from('chat_messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .in('id', messageIds);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const resetUnreadCount = async (
  chatRoomId: string,
  userType: 'hr' | 'candidate'
) => {
  const field =
    userType === 'hr' ? 'unread_count_hr' : 'unread_count_candidate';

  const { error } = await supabase
    .from('chat_rooms')
    .update({ [field]: 0 })
    .eq('id', chatRoomId);

  if (error) {
    console.error('Error resetting unread count:', error);
  }
};
