import { getTestById } from '@/features/testing-system/api/getTestById';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/shared/ui/layouts/DashboardLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestQuestionOptions } from '@/features/testing-system/ui/TestQuestionOptions';
import { submitTestResults } from '@/features/testing-system/api/submitTestResults';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const TestPassingPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, number | string>>({});

  const {
    data: test,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => getTestById(testId!),
    enabled: !!testId,
  });

  const submissionMutation = useMutation({
    mutationFn: submitTestResults,
    onSuccess: () => {
      toast.success('Тест успешно завершен!');
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      navigate(`/candidate/test/${testId}/results`);
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const handleAnswerChange = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const allQuestionsAnswered = test ? Object.keys(answers).length === test.test_questions.length : false;

  const handleSubmit = () => {
    if (!testId) return;
    submissionMutation.mutate({ testId, answers });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-5 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-8 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !test) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10 text-center">
          <p className="text-destructive">Не удалось загрузить тест. Попробуйте еще раз.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{test.name_ru}</CardTitle>
            <CardDescription>{test.description_ru}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {test.test_questions.map((question, index) => (
                <div key={question.id}>
                  <p className="font-semibold mb-4">
                    {index + 1}. {question.text_ru}
                  </p>
                  <TestQuestionOptions
                    question={question}
                    testType={test.test_type}
                    onAnswer={handleAnswerChange}
                    currentAnswer={answers[question.id]}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || submissionMutation.isPending}
              className="w-full md:w-auto"
            >
              {submissionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Завершить тест
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TestPassingPage;
