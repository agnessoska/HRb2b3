import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Application } from '../../types';

interface CandidateCardProps {
  application: Application;
  isDragging?: boolean;
}

export const CandidateCard = ({
  application,
  isDragging = false,
}: CandidateCardProps) => {
  const { t, i18n } = useTranslation(['funnel', 'tests']);
  const navigate = useNavigate();
  const lang = i18n.language as 'ru' | 'kk' | 'en';

  const categoryName =
    application.candidate.category?.[`name_${lang}`];

  const getTestsStatus = () => {
    if (application.candidate.tests_completed === 0) {
      return { badge: 'default', label: t('tests:noTests') };
    }

    const daysPassed = differenceInDays(
      new Date(),
      new Date(application.candidate.tests_last_updated_at || new Date())
    );
    const monthsPassed = daysPassed / 30;

    if (monthsPassed < 1) return { badge: 'success', label: t('tests:current') };
    if (monthsPassed < 2) return { badge: 'warning', label: t('tests:expiring') };
    return { badge: 'destructive', label: t('tests:expired') };
  };

  const testsStatus = getTestsStatus();

  return (
    <Card
      className={cn(
        'cursor-move hover:shadow-md transition-shadow',
        isDragging && 'shadow-lg'
      )}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold line-clamp-1">
            {application.candidate.full_name}
          </CardTitle>
          <Badge
            variant={
              testsStatus.badge as
                | 'default'
                | 'destructive'
                | 'outline'
                | 'secondary'
                | 'success'
                | 'warning'
            }
            className="text-xs flex-shrink-0"
          >
            {application.candidate.tests_completed}/6
          </Badge>
        </div>
        {categoryName && (
          <CardDescription className="text-xs line-clamp-1">
            {categoryName}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2">
        {application.compatibility_score !== null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('funnel:compatibility')}:
            </span>
            <span
              className={cn(
                'font-semibold',
                application.compatibility_score >= 80 && 'text-emerald-600',
                application.compatibility_score >= 60 &&
                  application.compatibility_score < 80 &&
                  'text-amber-600',
                application.compatibility_score < 60 && 'text-blue-600'
              )}
            >
              {application.compatibility_score}%
            </span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {t('funnel:added')}:{' '}
          {format(new Date(application.created_at), 'dd.MM.yyyy')}
        </div>

        <div className="flex gap-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={e => {
              e.stopPropagation();
              navigate(`/hr/candidate/${application.candidate.id}`);
            }}
          >
            <User className="h-3 w-3 mr-1" />
            {t('funnel:profile')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={e => {
              e.stopPropagation();
              navigate(`/hr/chat?candidateId=${application.candidate.id}`);
            }}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {t('funnel:chat')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
