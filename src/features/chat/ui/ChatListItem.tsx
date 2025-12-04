import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';
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
  const { i18n } = useTranslation('chat');
  const lang = i18n.language as 'ru' | 'kk' | 'en';
  
  const getLocale = (lang: string) => {
    switch (lang) {
      case 'ru': return ru;
      case 'kk': return kk;
      default: return enUS;
    }
  };

  const locale = getLocale(lang);

  const otherPerson =
    userType === 'hr' ? chatRoom.candidate : chatRoom.hr_specialist;

  const unreadCount =
    userType === 'hr'
      ? chatRoom.unread_count_hr
      : chatRoom.unread_count_candidate;

  return (
    <div className="px-2 py-1">
      <button
        onClick={onClick}
        className={cn(
          'w-full p-3 rounded-lg transition-all text-left group relative border border-transparent',
          isActive
            ? 'bg-primary/5 backdrop-blur-sm border-primary/10 shadow-sm'
            : 'hover:bg-muted/50 hover:border-border/50 hover:shadow-sm'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
            isActive
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm truncate text-foreground/90">
                {otherPerson.full_name}
              </p>
              {chatRoom.last_message_at && (
                <span className="text-[10px] text-muted-foreground/70 shrink-0">
                  {formatDistanceToNow(new Date(chatRoom.last_message_at), {
                    addSuffix: false,
                    locale: locale,
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <div />
              {unreadCount && unreadCount > 0 ? (
                <Badge variant="default" className="h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-[10px]">
                  {unreadCount}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
