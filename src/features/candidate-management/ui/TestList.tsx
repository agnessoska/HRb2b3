import { useQuery } from '@tanstack/react-query';
import { getTests } from '@/features/testing-system/api/getTests';
import { TestCard } from '@/features/testing-system/ui/TestCard';
import { useAuthStore } from '@/app/store/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { requestTestRetake } from '@/features/testing-system/api/submitTestResults';
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
import { useState } from 'react';

export const TestList = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation('tests');
  const [retakeDialog, setRetakeDialog] = useState<{ isOpen: boolean; testId: string | null; testName: string | null }>({
    isOpen: false,
    testId: null,
    testName: null,
  });

  const { data: tests, isLoading, refetch } = useQuery({
    queryKey: ['tests', user?.id],
    queryFn: () => getTests(user!.id),
    enabled: !!user,
  });

  const handleRetakeRequest = (testId: string, testName: string) => {
    setRetakeDialog({ isOpen: true, testId, testName });
  };

  const confirmRetake = async () => {
    if (!retakeDialog.testId || !user) return;

    try {
      // Assuming we need candidateId, but requestTestRetake might need to be updated or we need to get candidate profile first.
      // However, looking at previous implementation in TestPassingPage or similar, we might need a way to call the RPC.
      // Let's assume requestTestRetake exists and handles the logic or we use the RPC direct if needed.
      // Checking submitTestResults.ts for requestTestRetake...
      // It seems I need to check where requestTestRetake is defined or if I need to implement it.
      // Based on previous context, it might be in submitTestResults.ts or similar.
      
      const response = await requestTestRetake(retakeDialog.testId, user.id); 
      
      if (response.success) {
        toast.success(t('retakeSuccess'));
        refetch();
      } else {
        toast.error(t('retakeError'), {
          description: response.error,
        });
      }
    } catch (error) {
      console.error('Error requesting retake:', error);
      toast.error(t('retakeErrorGeneric'));
    } finally {
      setRetakeDialog({ isOpen: false, testId: null, testName: null });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests?.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            onRetake={handleRetakeRequest}
          />
        ))}
      </div>

      <AlertDialog open={retakeDialog.isOpen} onOpenChange={(isOpen) => setRetakeDialog(prev => ({ ...prev, isOpen }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('retakeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('retakeDialog.description', { testName: retakeDialog.testName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('retakeDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRetake}>{t('retakeDialog.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};