import { DashboardLayout } from '@/shared/ui/layouts/DashboardLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTests } from '@/features/testing-system/api/getTests';
import { TestCard } from '@/features/testing-system/ui/TestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/app/store/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CandidateDashboardPage = () => {
  const { t } = useTranslation(['dashboard', 'tests']);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [retakeTestInfo, setRetakeTestInfo] = useState<{ id: string; name: string } | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);

  const { data: tests, isLoading, isError } = useQuery({
    queryKey: ['tests', user?.id],
    queryFn: () => getTests(user!.id),
    enabled: !!user,
  });

  const handleConfirmRetake = async () => {
    if (!retakeTestInfo || !user) return;

    setIsRetaking(true);
    try {
      const { data, error } = await supabase.rpc('request_test_retake', {
        p_candidate_id: user.id,
        p_test_id: retakeTestInfo.id,
      }) as unknown as { data: { success: boolean; error?: string }, error: Error | null };

      if (error) throw error;

      if (!data.success) {
        toast.error(data.error || t('tests:retakeConfirm.errorMessage'));
        return;
      }

      toast.success(t('tests:retakeConfirm.successMessage'));
      await queryClient.invalidateQueries({ queryKey: ['tests', user.id] });
      navigate(`/candidate/test/${retakeTestInfo.id}`);
    } catch (error) {
      const err = error as Error;
      toast.error(t('tests:retakeConfirm.errorMessage'), { description: err.message });
    } finally {
      setIsRetaking(false);
      setRetakeTestInfo(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">{t('myTests')}</h1>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[280px]" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-destructive text-center py-10">
            {t('errorLoadingTests')}
          </div>
        )}

        {tests && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onRetake={(testId, testName) => setRetakeTestInfo({ id: testId, name: testName })}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!retakeTestInfo} onOpenChange={() => setRetakeTestInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tests:retakeConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tests:retakeConfirm.description', { testName: retakeTestInfo?.name })}
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">⚠️ {t('tests:retakeConfirm.warningTitle')}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t('tests:retakeConfirm.warning1')}</li>
                  <li>{t('tests:retakeConfirm.warning2')}</li>
                  <li>{t('tests:retakeConfirm.warning3')}</li>
                  <li>{t('tests:retakeConfirm.warning4')}</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRetaking}>{t('tests:retakeConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRetake} disabled={isRetaking}>
              {isRetaking ? t('tests:submitting') : t('tests:retakeConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CandidateDashboardPage;
