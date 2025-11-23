import { getTestById } from '@/features/testing-system/api/getTestById';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, FileQuestion, CheckCircle, Heart, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/app/store/auth';
import { Progress } from '@/components/ui/progress';
import { QuestionCard } from '@/features/testing-system/ui/QuestionCard';
import { MBTIQuestionCard } from '@/features/testing-system/ui/MBTIQuestionCard';
import { DISCQuestionCard } from '@/features/testing-system/ui/DISCQuestionCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { addMonths } from 'date-fns';
import { getCandidateProfileByUserId } from '@/features/candidate-management/api/getCandidateProfileByUserId';
import type { TestWithQuestions, TestQuestion } from '@/shared/types/database';
import type { Json } from '@/shared/types/database';

type TestState = 'loading' | 'instructions' | 'inProgress' | 'submitting';

type CalculatedResults = {
  raw_scores: Record<string, number>;
  normalized_scores: Record<string, number>;
  detailed_result: string | null;
};

const TestPassingPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation(['tests', 'common']);
  const lang = i18n.language as 'ru' | 'kk' | 'en';
  const { user } = useAuthStore();

  const [testState, setTestState] = useState<TestState>('loading');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { data: test, isLoading, isError } = useQuery<TestWithQuestions | null>({
    queryKey: ['test', testId],
    queryFn: () => getTestById(testId!),
    enabled: !!testId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (test) setTestState('instructions');
    if (isError) setTestState('loading');
  }, [test, isError]);

  useEffect(() => {
    if (test && testId) {
      const backup = localStorage.getItem(`test_${testId}_backup`);
      if (backup) {
        setShowRestoreDialog(true);
      }
    }
  }, [test, testId]);

  const { data: candidateProfile } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: () => getCandidateProfileByUserId(user!.id),
    enabled: !!user,
  });

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test?.test_questions.length || 0;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const allAnswered = answeredCount === totalQuestions;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testState === 'inProgress' && answeredCount > 0) {
        e.preventDefault();
        e.returnValue = t('confirmExit');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [testState, answeredCount, t]);

  const handleAnswer = (questionNumber: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: value }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error(t('pleaseAnswerAll'));
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!test || !testId || !candidateProfile) return;
    setTestState('submitting');
    try {
      const { data: calculatedResults, error: calcError } = await supabase.rpc(
        'calculate_test_results',
        { p_test_id: test.id, p_answers: answers }
      ) as unknown as { data: CalculatedResults, error: Error | null };

      if (calcError) throw calcError;

      const { error: saveError } = await supabase
        .from('candidate_test_results')
        .insert({
          candidate_id: candidateProfile.id,
          test_id: testId,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          answers: answers as Json,
          raw_scores: calculatedResults.raw_scores as Json,
          normalized_scores: calculatedResults.normalized_scores as Json,
          detailed_result: calculatedResults.detailed_result,
          retake_available_at: addMonths(new Date(), 1).toISOString()
        });
      if (saveError) throw saveError;

      localStorage.removeItem(`test_${testId}_backup`);

      toast.success(t('submitted'));
      await queryClient.invalidateQueries({ queryKey: ['tests', user?.id] });
      navigate(`/candidate/test/${testId}/results`);
    } catch (error) {
      console.error('Error submitting test:', error);
      localStorage.setItem(`test_${testId}_backup`, JSON.stringify(answers));
      toast.error(t('submitErrorBackup'), {
        duration: 10000,
        description: t('submitErrorBackupDescription'),
      });
      setTestState('inProgress');
    }
  };

  const handleRestoreAnswers = () => {
    const backup = localStorage.getItem(`test_${testId!}_backup`);
    if (backup) {
      setAnswers(JSON.parse(backup));
      toast.info(t('restoreBackupSuccess'));
    }
    setTestState('inProgress');
    setShowRestoreDialog(false);
  };

  const handleDeclineRestore = () => {
    localStorage.removeItem(`test_${testId!}_backup`);
    setShowRestoreDialog(false);
    setTestState('instructions');
  };

  if (isLoading || testState === 'loading') {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isError || !test) {
    return <div className="container mx-auto py-10 text-center"><p className="text-destructive">{t('errorLoadingTests')}</p></div>;
  }

  if (testState === 'instructions') {
    return (
      <>
        <div className="max-w-2xl mx-auto p-6 space-y-6 my-10">
          <Card className="p-8">
            <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">{test[`name_${lang}`]}</h1>
            <p className="text-lg text-muted-foreground">{test[`description_${lang}`]}</p>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('instructions.title')}</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3"><FileQuestion className="h-5 w-5 mt-0.5 text-primary" /><span>{t('instructions.totalQuestions')}: {test.total_questions}</span></li>
            <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 mt-0.5 text-primary" /><span>{t('instructions.noWrongAnswers')}</span></li>
            <li className="flex items-start gap-3"><Heart className="h-5 w-5 mt-0.5 text-primary" /><span>{t('instructions.answerHonestly')}</span></li>
            <li className="flex items-start gap-3"><ArrowLeft className="h-5 w-5 mt-0.5 text-primary" /><span>{t('instructions.canGoBack')}</span></li>
            <li className="flex items-start gap-3"><AlertCircle className="h-5 w-5 mt-0.5 text-destructive" /><span className="text-muted-foreground">{t('instructions.noSaveOnExit')}</span></li>
          </ul>
        </Card>
        <div className="flex justify-center"><Button onClick={() => setTestState('inProgress')} size="lg" className="px-12">{t('startTest')}</Button></div>
      </div>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('restoreBackup.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('restoreBackup.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeclineRestore}>{t('restoreBackup.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreAnswers}>{t('restoreBackup.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={() => { if (window.confirm(t('confirmExit'))) { navigate('/candidate/dashboard') } }}>
              <ArrowLeft className="h-4 w-4 mr-2" />{t('common:back')}
            </Button>
            <div className="text-sm font-medium">{t('progress')}: {answeredCount}/{totalQuestions} ({Math.round(progress)}%)</div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {test.test_questions.sort((a: TestQuestion, b: TestQuestion) => a.question_number - b.question_number).map((question: TestQuestion) => (
            <div key={question.id} ref={(el) => { questionRefs.current[question.question_number] = el; }}>
              {test.test_type === 'scale' && <QuestionCard question={question as TestQuestion & { options: { ru: string[], kk: string[], en: string[], values: number[] } }} questionNumber={question.question_number} totalQuestions={totalQuestions} selectedValue={answers[question.question_number]} onAnswer={(value) => handleAnswer(question.question_number, value)} />}
              {test.test_type === 'dichotomy' && <MBTIQuestionCard question={question as TestQuestion & { options: { ru: string[], kk: string[], en: string[], values: number[] } }} questionNumber={question.question_number} totalQuestions={totalQuestions} selectedValue={answers[question.question_number]} onAnswer={(value) => handleAnswer(question.question_number, value)} />}
              {test.test_type === 'style' && <DISCQuestionCard question={question as TestQuestion & { options: { ru: string[], kk: string[], en: string[], values: number[] } }} questionNumber={question.question_number} totalQuestions={totalQuestions} selectedValue={answers[question.question_number]} onAnswer={(value) => handleAnswer(question.question_number, value)} />}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-background border-t">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{t('answered')}: {answeredCount} {t('of')} {totalQuestions}</div>
            <Button onClick={handleSubmit} disabled={!allAnswered || testState === 'submitting'} size="lg">
              {testState === 'submitting' ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('submitting')}</>) : (t('completeTest'))}
            </Button>
          </div>
          {!allAnswered && (<p className="text-xs text-destructive mt-2 text-right">{t('pleaseAnswerAll')}</p>)}
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmSubmit.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmSubmit.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('confirmSubmit.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>{t('confirmSubmit.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestPassingPage;
