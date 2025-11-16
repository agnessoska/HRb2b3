import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const { data: candidates, isLoading } = useQuery({
    queryKey: [
      'search-candidates',
      vacancyId,
      organization?.id,
      debouncedSearch,
    ],
    queryFn: () => {
      if (!debouncedSearch || !organization?.id) return [];
      return searchCandidatesNotInFunnel(
        vacancyId,
        organization.id,
        debouncedSearch
      );
    },
    enabled: debouncedSearch.length > 2 && !!organization?.id,
  });

  const addMutation = useMutation({
    mutationFn: (candidateId: string) => {
      if (!hrProfile || !organization) throw new Error('Missing profile');
      return addCandidateToFunnel(
        vacancyId,
        candidateId,
        hrProfile.id,
        organization.id
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
          <DialogTitle>{t('addCandidate')}</DialogTitle>
          <DialogDescription>{t('addCandidateDescription')}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input
            placeholder={t('searchCandidatePlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isLoading && <p>{t('common:loading')}...</p>}
            {candidates?.map(candidate => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
              >
                <span>{candidate.full_name}</span>
                <Button
                  size="sm"
                  onClick={() => addMutation.mutate(candidate.id)}
                  disabled={addMutation.isPending}
                >
                  {t('add')}
                </Button>
              </div>
            ))}
            {debouncedSearch.length > 2 && !isLoading && candidates?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noCandidatesFound')}
              </p>
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
