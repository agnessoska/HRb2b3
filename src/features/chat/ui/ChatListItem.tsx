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
          'w-full p-3 rounded-lg transition-all text-left group relative border border-transparent',
          isActive
            ? 'bg-primary/5 backdrop-blur-sm border-primary/10 shadow-sm'
            : 'hover:bg-muted/50 hover:border-border/50 hover:shadow-sm'
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "w-9 h-9 border-2 border-background shadow-sm transition-transform",
            isActive ? "scale-105 ring-2 ring-primary/20" : ""
          )}>
            {/*
              TODO: Add avatar_url to ChatRoom types (needs updating get_my_chat_rooms RPC or join logic)
              For now we rely on the fact that otherPerson might not have avatar_url yet in the ChatRoom type
              We can add it if we update the RPC. For now let's assume it might be there or fallback.
            */}
            {/* @ts-expect-error: avatar_url might be missing in type but present in data if we update RPC */}
            <AvatarImage src={otherPerson.avatar_url} />
            <AvatarFallback className={cn(
              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
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
