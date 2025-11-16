import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ChatRoom } from '../types';

interface ChatListItemProps {
  chatRoom: ChatRoom;
  userType: 'hr' | 'candidate';
  isActive: boolean;
  onClick: () => void;
}

export const ChatListItem = ({
  chatRoom,
  userType,
  isActive,
  onClick,
}: ChatListItemProps) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ru' | 'kk' | 'en';
  const locale = lang === 'ru' ? ru : enUS; // kk locale is missing

  const otherPerson =
    userType === 'hr' ? chatRoom.candidate : chatRoom.hr_specialist;

  const unreadCount =
    userType === 'hr'
      ? chatRoom.unread_count_hr
      : chatRoom.unread_count_candidate;

  const categoryName =
    userType === 'hr' && chatRoom.candidate.category
      ? chatRoom.candidate.category[`name_${lang}`]
      : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 border-b hover:bg-accent transition-colors text-left',
        isActive && 'bg-accent'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm truncate">
              {otherPerson.full_name}
            </p>
            {unreadCount && unreadCount > 0 && (
              <Badge variant="default" className="flex-shrink-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          {categoryName && (
            <p className="text-xs text-muted-foreground truncate mb-1">
              {categoryName}
            </p>
          )}
          {chatRoom.last_message_at && (
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(chatRoom.last_message_at), {
                addSuffix: true,
                locale: locale,
              })}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
