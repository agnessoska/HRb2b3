import { useState, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useOrganization } from '@/shared/hooks/useOrganization';
import { HelpCircle } from '@/shared/ui/HelpCircle';
import { useHrProfile } from '@/shared/hooks/useHrProfile';
import {
  searchCandidatesNotInFunnel,
  addCandidateToFunnel,
} from '../../api/funnel';
import { toast } from 'sonner';

interface AddCandidateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  vacancyId: string;
}

export const AddCandidateDialog = ({
  isOpen,
  onOpenChange,
  vacancyId,
}: AddCandidateDialogProps) => {
  const { t } = useTranslation(['funnel', 'common']);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const queryClient = useQueryClient();

  const { data: organization } = useOrganization();
  const { data: hrProfile } = useHrProfile();

  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['search-candidates', vacancyId, organization?.id, debouncedSearch],
    queryFn: ({ pageParam = 0 }) => {
      if (!organization?.id) return Promise.resolve([]);
      return searchCandidatesNotInFunnel(
        vacancyId,
        organization.id,
        debouncedSearch,
        pageParam
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined;
    },
    enabled: !!organization?.id,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const candidates = data?.pages.flat() || [];

  const addMutation = useMutation({
    mutationFn: ({ candidateId, testsCompleted }: { candidateId: string; testsCompleted: number }) => {
      if (!hrProfile || !organization) throw new Error('Missing profile');

      // Определяем начальный статус на основе пройденных тестов
      let initialStatus = 'invited';
      if (testsCompleted === 6) {
        initialStatus = 'evaluated';
      } else if (testsCompleted > 0) {
        initialStatus = 'testing';
      }

      return addCandidateToFunnel(
        vacancyId,
        candidateId,
        hrProfile.id,
        organization.id,
        initialStatus
      );
    },
    onSuccess: () => {
      toast.success(t('candidateAdded'));
      queryClient.invalidateQueries({ queryKey: ['applications', vacancyId] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t('common:errors.general'));
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{t('addCandidate')}</DialogTitle>
            <HelpCircle topicId="candidates_base" iconClassName="h-4 w-4" />
          </div>
          <DialogDescription>{t('addCandidateDescription')}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input
            placeholder={t('searchCandidatePlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {candidates.map(candidate => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{candidate.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {candidate.tests_completed || 0}/6 {t('common:tests', { defaultValue: 'тестов' })}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => addMutation.mutate({ 
                    candidateId: candidate.id, 
                    testsCompleted: candidate.tests_completed || 0 
                  })}
                  disabled={addMutation.isPending}
                >
                  {t('add')}
                </Button>
              </div>
            ))}
            
            {isLoading && (
              <div className="py-2 text-center text-sm text-muted-foreground">
                {t('common:loading')}...
              </div>
            )}

            {!isLoading && candidates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noCandidatesFound')}
              </p>
            )}

            {hasNextPage && (
              <div ref={ref} className="py-2 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? t('common:loading') + '...' : ''}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
