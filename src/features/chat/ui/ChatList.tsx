import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Search } from 'lucide-react';
import { ChatListItem } from './ChatListItem';
import { EmptyChatState } from './EmptyChatState';
import { ChatSkeleton } from './ChatSkeleton';
import type { ChatRoom } from '../types';

interface ChatListProps {
  chatRooms: ChatRoom[] | undefined;
  userType: 'hr' | 'candidate';
  activeChatRoomId: string | null;
  onChatSelect: (chatRoomId: string, otherUserId: string) => void;
  isLoading?: boolean;
}

export const ChatList = ({
  chatRooms,
  userType,
  activeChatRoomId,
  onChatSelect,
  isLoading = false,
}: ChatListProps) => {
  const { t } = useTranslation('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const filteredChats = useMemo(() => {
    if (!chatRooms) return [];
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="h-6 w-24 bg-muted rounded mb-3 animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ChatSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="py-2 px-3 border-b bg-muted/30 h-[53px] flex items-center shrink-0">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-background border-muted-foreground/20 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!chatRooms || chatRooms.length === 0 ? (
          <EmptyChatState />
        ) : filteredChats.length === 0 ? (
          <EmptyChatState /> // Can customize for "No search results" if needed
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
