import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/shared/hooks/useOrganization';
import { useHrProfile } from '@/shared/hooks/useHrProfile';
import { useGetVacancies } from '@/features/vacancy-management/api/getVacancies';
import { addCandidateToFunnel } from '@/features/vacancy-management/api/funnel';
import { toast } from 'sonner';
import { Loader2, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AssignToVacancyDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  candidateId: string;
  candidateName: string;
  assignedVacancyIds: string[];
}

export const AssignToVacancyDialog = ({
  isOpen,
  onOpenChange,
  candidateId,
  candidateName,
  assignedVacancyIds,
}: AssignToVacancyDialogProps) => {
  const { t } = useTranslation(['candidates', 'common', 'vacancies']);
  const queryClient = useQueryClient();
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);

  const { data: organization } = useOrganization();
  const { data: hrProfile } = useHrProfile();
  const { data: vacancies, isLoading: isLoadingVacancies } = useGetVacancies();

  const activeVacancies = vacancies?.filter(v => v.status === 'active') || [];

  const assignMutation = useMutation({
    mutationFn: () => {
      if (!hrProfile || !organization || !selectedVacancyId) {
        throw new Error('Missing required data');
      }
      return addCandidateToFunnel(
        selectedVacancyId,
        candidateId,
        hrProfile.id,
        organization.id
      );
    },
    onSuccess: () => {
      toast.success(t('assignDialog.success'));
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onOpenChange(false);
      setSelectedVacancyId(null);
    },
    onError: () => {
      toast.error(t('common:errors.general'));
    },
  });

  const handleAssign = () => {
    if (!selectedVacancyId) {
      toast.error(t('assignDialog.selectVacancyError'));
      return;
    }
    assignMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('assignDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('assignDialog.description', { name: candidateName })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoadingVacancies ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeVacancies.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t('assignDialog.noActiveVacancies')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {activeVacancies.map((vacancy) => {
                const isAssigned = assignedVacancyIds.includes(vacancy.id);
                return (
                  <button
                    key={vacancy.id}
                    onClick={() => !isAssigned && setSelectedVacancyId(vacancy.id)}
                    disabled={isAssigned}
                    className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                      isAssigned
                        ? 'border-border bg-muted/50 opacity-60 cursor-not-allowed'
                        : selectedVacancyId === vacancy.id
                        ? 'border-primary bg-primary/5 hover:border-primary/70'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{vacancy.title}</h4>
                          {isAssigned && (
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('assignDialog.alreadyAssigned')}
                            </Badge>
                          )}
                        </div>
                        {vacancy.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {vacancy.description}
                          </p>
                        )}
                      </div>
                      {!isAssigned && selectedVacancyId === vacancy.id && (
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <ArrowRight className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedVacancyId || assignMutation.isPending}
          >
            {assignMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t('assignDialog.assignButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};