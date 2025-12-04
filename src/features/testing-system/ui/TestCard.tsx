import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import type { TestWithResult } from '../api/getTests';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, FileQuestion } from 'lucide-react';

interface TestCardProps {
  test: TestWithResult;
  onRetake: (testId: string, testName: string) => void;
}

export const TestCard = ({ test, onRetake }: TestCardProps) => {
  const { t, i18n } = useTranslation('tests');
  const navigate = useNavigate();
  const lang = i18n.language as 'ru' | 'kk' | 'en';

  const getStatus = () => {
    if (!test.result?.completed_at) {
      return {
        type: 'not_taken',
        badge: 'default',
        label: t('status.notTaken'),
        canRetake: false,
      };
    }

    const daysPassed = differenceInDays(new Date(), new Date(test.result.completed_at));
    const monthsPassed = daysPassed / 30;

    if (monthsPassed < 1) {
      return {
        type: 'current',
        badge: 'success',
        label: t('status.current'),
        canRetake: false,
      };
    } else if (monthsPassed < 2) {
      return {
        type: 'expiring',
        badge: 'warning',
        label: t('status.expiringSoon'),
        canRetake: true,
      };
    } else {
      return {
        type: 'expired',
        badge: 'destructive',
        label: t('status.expired'),
        canRetake: true,
      };
    }
  };

  const status = getStatus();

  const handleAction = () => {
    if (!test.result) {
      navigate(`/candidate/test/${test.id}`);
    } else if (status.canRetake) {
      onRetake(test.id, test[`name_${lang}`] as string);
    } else {
      navigate(`/candidate/test/${test.id}/results`);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{test[`name_${lang}`]}</CardTitle>
          <Badge
            variant={status.badge as "default" | "destructive" | "outline" | "secondary" | "success" | "warning"}
            className="whitespace-nowrap shrink-0"
          >
            {status.label}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {test[`description_${lang}`]}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            <span>{test.total_questions} {t('questions')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>~{test.time_limit_minutes || 30} {t('minutes')}</span>
          </div>
          {test.result?.completed_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {t('completed')}: {format(new Date(test.result.completed_at), 'dd.MM.yyyy')}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAction}
          className="w-full"
          variant={!test.result ? "default" : status.canRetake ? "outline" : "secondary"}
        >
          {!test.result && t('startTest')}
          {test.result && !status.canRetake && t('viewResults')}
          {test.result && status.canRetake && t('retakeTest')}
        </Button>
      </CardFooter>
    </Card>
  );
};
