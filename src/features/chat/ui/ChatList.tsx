import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Search, MessageSquare } from 'lucide-react';
import { ChatListItem } from './';
import type { ChatRoom } from '../types';

interface ChatListProps {
  chatRooms: ChatRoom[];
  userType: 'hr' | 'candidate';
  activeChatRoomId: string | null;
  onChatSelect: (chatRoomId: string, otherUserId: string) => void;
}

export const ChatList = ({
  chatRooms,
  userType,
  activeChatRoomId,
  onChatSelect,
}: ChatListProps) => {
  const { t } = useTranslation('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const filteredChats = useMemo(() => {
    if (!debouncedSearch) return chatRooms;

    const query = debouncedSearch.toLowerCase();
    return chatRooms.filter(room => {
      const name =
        userType === 'hr'
          ? room.candidate.full_name
          : room.hr_specialist.full_name;
      return name?.toLowerCase().includes(query) || false;
    });
  }, [chatRooms, debouncedSearch, userType]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">{t('messages')}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-sm">{t('noChats')}</p>
          </div>
        ) : (
          filteredChats.map(room => {
            const otherUser =
              userType === 'hr' ? room.candidate : room.hr_specialist;
            return (
              <ChatListItem
                key={room.id}
                chatRoom={room}
                userType={userType}
                isActive={room.id === activeChatRoomId}
                onClick={() => onChatSelect(room.id, otherUser.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
