import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import type { TestWithResult } from '../api/getTests';
import { Badge } from '@/components/ui/badge';
import { differenceInMonths, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TestCardProps {
  test: TestWithResult;
}

export const TestCard = ({ test }: TestCardProps) => {
  const navigate = useNavigate();

  const getStatus = () => {
    if (!test.result?.completed_at) {
      return { text: 'Не пройден', color: 'bg-gray-500', canRetake: false };
    }

    const completedDate = new Date(test.result.completed_at);
    const monthsPassed = differenceInMonths(new Date(), completedDate);

    if (monthsPassed < 1) {
      return { text: `Пройден ${formatDistanceToNow(completedDate, { addSuffix: true, locale: ru })}`, color: 'bg-green-500', canRetake: false };
    }
    if (monthsPassed <= 2) {
      return { text: 'Можно пересдать', color: 'bg-yellow-500', canRetake: true };
    }
    return { text: 'Результат устарел', color: 'bg-red-500', canRetake: true };
  };

  const status = getStatus();

  const handleAction = () => {
    if (status.canRetake || !test.result) {
      // TODO: Add retake logic (delete old result) before navigating
      navigate(`/candidate/test/${test.id}`);
    } else {
      navigate(`/candidate/test/${test.id}/results`);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{test.name_ru}</CardTitle>
          <Badge className={`${status.color} text-white`}>{status.text}</Badge>
        </div>
        <CardDescription>{test.description_ru}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          {test.total_questions} вопросов
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAction} className="w-full">
          {test.result && !status.canRetake ? 'Посмотреть результат' : status.canRetake ? 'Пересдать' : 'Пройти тест'}
        </Button>
      </CardFooter>
    </Card>
  );
};
