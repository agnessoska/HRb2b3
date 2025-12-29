import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/shared/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/app/store/auth";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TokenCostBanner } from "@/shared/ui/TokenCostBanner";
import { useHrProfile } from "@/shared/hooks/useHrProfile";
import { useTokenCalculation } from "@/shared/hooks/useTokenCalculation";
import type { TalentMarketCandidate } from "../types";

interface AcquireCandidateDialogProps {
  candidate: TalentMarketCandidate;
  vacancyId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AcquireCandidateDialog = ({
  candidate,
  vacancyId,
  isOpen,
  onClose,
  onSuccess
}: AcquireCandidateDialogProps) => {
  const { t } = useTranslation('talent-market');
  const [selectedVacancyId, setSelectedVacancyId] = useState(vacancyId || '');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { calculation } = useTokenCalculation('acquire_candidate_from_market');
  const { data: hrProfile, isLoading: isHrProfileLoading } = useHrProfile();

  const { data: vacancies } = useQuery({
    queryKey: ['active-vacancies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vacancies')
        .select('id, title')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const COST_TOKENS = calculation?.expectedCost || 1000;
  const hasEnoughTokens = !!calculation?.hasEnough;

  const handleAcquire = async () => {
    if (!selectedVacancyId) {
      toast.error(t('filters.vacancyPlaceholder'));
      return;
    }
    if (!hasEnoughTokens) {
      toast.error(t('acquireDialog.noTokensTitle'));
      return;
    }
    if (!user || !hrProfile) {
      // This case is handled by the disabled button, but as a safeguard:
      toast.error('User profile not loaded. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('acquire_candidate_from_market', {
        p_candidate_id: candidate.candidate_id || candidate.id || '',
        p_vacancy_id: selectedVacancyId,
        p_hr_specialist_id: hrProfile.id
      });

      if (error) throw error;

      if (!(data as { success: boolean; error?: string }).success) {
        toast.error((data as { success: boolean; error?: string }).error || t('acquireDialog.error'));
        return;
      }

      toast.success(t('acquireDialog.success'));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error acquiring candidate:', error);
      toast.error(t('acquireDialog.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('acquireDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('acquireDialog.description', { name: candidate.full_name })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {'professional_compatibility' in candidate && candidate.professional_compatibility !== null && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>{t('card.overallCompatibility')}</AlertTitle>
              <AlertDescription>
                <span className="text-2xl font-bold text-primary">
                  {candidate.overall_compatibility}%
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label>{t('filters.vacancy')} *</Label>
            <Select
              value={selectedVacancyId}
              onValueChange={setSelectedVacancyId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('filters.vacancyPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {vacancies?.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.id}>
                    {vacancy.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <TokenCostBanner operationType="acquire_candidate_from_market" />
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{t('acquireDialog.whatHappens')}:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('acquireDialog.happen1')}</li>
              <li>{t('acquireDialog.happen2')}</li>
              <li>{t('acquireDialog.happen3')}</li>
              <li>{t('acquireDialog.happen4')}</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleAcquire}
            disabled={!selectedVacancyId || !hasEnoughTokens || isLoading || isHrProfileLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('acquireDialog.adding')}...
              </>
            ) : (
              t('acquireDialog.confirm', { cost: COST_TOKENS.toLocaleString() })
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
