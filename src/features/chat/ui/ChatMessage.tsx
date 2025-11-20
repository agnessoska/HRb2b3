import { format } from 'date-fns';
import { Check, CheckCheck, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export const ChatMessage = ({ message, isOwn }: ChatMessageProps) => {
  const isImage = message.attachment_type?.startsWith('image/');

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {message.attachment_url && (
          <div className="mb-2">
            {isImage ? (
              <img
                src={message.attachment_url}
                alt="attachment"
                className="rounded-md max-h-48 object-cover cursor-pointer"
                onClick={() => window.open(message.attachment_url!, '_blank')}
              />
            ) : (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-background/20 rounded-md hover:bg-background/30 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm truncate underline">{message.attachment_name || 'File'}</span>
              </a>
            )}
          </div>
        )}
        {message.message_text && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message_text}
          </p>
        )}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          <span>{format(new Date(message.created_at), 'HH:mm')}</span>
          {isOwn &&
            (message.is_read ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            ))}
        </div>
      </div>
    </div>
  );
};
