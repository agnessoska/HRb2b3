import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const EmptyChatState = () => {
  const { t } = useTranslation('chat');
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <MessageSquare className="h-12 w-12 mb-3" />
      <p className="text-sm font-medium">{t('noMessages')}</p>
      <p className="text-xs mt-1">{t('startConversation')}</p>
    </div>
  );
};
