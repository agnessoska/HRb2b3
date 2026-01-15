import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  const initials = otherPerson.full_name?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="px-2 py-1">
      <button
        onClick={onClick}
        className={cn(
          'w-full p-4 rounded-2xl transition-all text-left group relative border',
          isActive
            ? 'bg-primary/10 backdrop-blur-md border-primary/20 shadow-lg shadow-primary/5'
            : 'bg-transparent border-transparent hover:bg-accent/30 hover:border-border/50'
        )}
      >
        <div className="flex items-center gap-4">
          <Avatar className={cn(
            "w-12 h-12 border-2 border-background shadow-md transition-all duration-300",
            isActive ? "scale-110 ring-4 ring-primary/10" : "group-hover:scale-105"
          )}>
            <AvatarImage src={otherPerson.avatar_url || undefined} />
            <AvatarFallback className={cn(
              isActive ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground font-bold"
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                {otherPerson.full_name}
              </p>
              {chatRoom.last_message_at && (
                <span className="text-[10px] font-medium text-muted-foreground/60 shrink-0">
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
                <Badge variant="default" className="h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center text-[10px] font-black rounded-full animate-pulse shadow-lg shadow-primary/20">
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
