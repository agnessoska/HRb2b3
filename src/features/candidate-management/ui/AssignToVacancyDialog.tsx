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
import { cn } from '@/lib/utils';

interface AssignToVacancyDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  candidateId: string;
  candidateName: string;
  assignedVacancyIds: string[];
  testsCompleted: number;
}

export const AssignToVacancyDialog = ({
  isOpen,
  onOpenChange,
  candidateId,
  candidateName,
  assignedVacancyIds,
  testsCompleted,
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

      // Определяем начальный статус на основе пройденных тестов
      let initialStatus = 'invited';
      if (testsCompleted === 6) {
        initialStatus = 'evaluated';
      } else if (testsCompleted > 0) {
        initialStatus = 'testing';
      }

      return addCandidateToFunnel(
        selectedVacancyId,
        candidateId,
        hrProfile.id,
        organization.id,
        initialStatus
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
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tighter">{t('assignDialog.title')}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {t('assignDialog.description', { name: candidateName })}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8">
          {isLoadingVacancies ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
            </div>
          ) : activeVacancies.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border/50 p-10 text-center bg-muted/5">
              <div className="h-16 w-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 opacity-30 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground/70">
                {t('assignDialog.noActiveVacancies')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {activeVacancies.map((vacancy) => {
                const isAssigned = assignedVacancyIds.includes(vacancy.id);
                return (
                  <button
                    key={vacancy.id}
                    onClick={() => !isAssigned && setSelectedVacancyId(vacancy.id)}
                    disabled={isAssigned}
                    className={cn(
                      "w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 relative overflow-hidden",
                      isAssigned
                        ? 'border-border/30 bg-muted/10 opacity-50 cursor-not-allowed grayscale-[0.5]'
                        : selectedVacancyId === vacancy.id
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-xl shadow-primary/5'
                        : 'border-border/50 bg-background/50 hover:border-primary/30 hover:bg-background shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            "font-bold truncate transition-colors",
                            selectedVacancyId === vacancy.id ? "text-primary" : "text-foreground"
                          )}>{vacancy.title}</h4>
                          {isAssigned && (
                            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] h-5">
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
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
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

        <DialogFooter className="p-8 bg-muted/20 border-t border-border/50 backdrop-blur-md">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-8 font-bold hover:bg-accent/50">
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedVacancyId || assignMutation.isPending}
            className="rounded-xl px-10 font-bold shadow-xl shadow-primary/30 h-12"
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
