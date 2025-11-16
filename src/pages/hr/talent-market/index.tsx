import { DashboardLayout } from '@/shared/ui/layouts/DashboardLayout';
import { TalentMarketFilters, type MarketFilters } from '@/features/talent-market/ui/TalentMarketFilters';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTalentMarket } from '@/features/talent-market/api/useTalentMarket';
import { Skeleton } from '@/components/ui/skeleton';
import { TalentCard } from '@/features/talent-market/ui/TalentCard';
import type { TalentMarketCandidate } from '@/features/talent-market/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/app/store/auth';
import { AcquireCandidateDialog } from '@/features/talent-market/ui/AcquireCandidateDialog';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

const TalentMarketPage = () => {
  const { t } = useTranslation('talent-market');
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MarketFilters>({
    vacancyId: null,
    categoryId: null,
    skills: [],
    minTestsCompleted: 0,
    sortBy: 'compatibility',
  });
  const [candidateToAcquire, setCandidateToAcquire] = useState<TalentMarketCandidate | null>(null);
  const { user } = useAuthStore();
  const { ref, inView } = useInView();

  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useTalentMarket(filters);

  const candidates = data?.pages.flatMap(page => page) ?? [];

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: acquiredCandidates } = useQuery({
    queryKey: ['acquired-candidates', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('applications').select('candidate_id').eq('organization_id', user!.id);
      return data?.map(item => item.candidate_id) || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <TalentMarketFilters onFilterChange={setFilters} />

        <div className="mt-8">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton key={index} className="h-96" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-destructive text-center py-10">
              {t('loadingError')}
            </div>
          )}

          {candidates && candidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate: any) => (
                  <TalentCard
                    key={candidate.candidate_id}
                    candidate={candidate}
                    isAcquired={acquiredCandidates?.includes(candidate.candidate_id) || false}
                    onAcquire={() => setCandidateToAcquire(candidate as TalentMarketCandidate)}
                  />
                ))}
            </div>
          )}

          {candidates && candidates.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('noCandidatesFound')}</p>
            </div>
          )}

          <div ref={ref} className="flex justify-center mt-8">
            {isFetchingNextPage && <Loader2 className="h-8 w-8 animate-spin" />}
            {!hasNextPage && candidates.length > 0 && (
              <p className="text-muted-foreground">{t('noMoreCandidates')}</p>
            )}
          </div>
        </div>
      </div>

      {candidateToAcquire && (
        <AcquireCandidateDialog
          candidate={candidateToAcquire}
          vacancyId={filters.vacancyId}
          isOpen={!!candidateToAcquire}
          onClose={() => setCandidateToAcquire(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['talent-market'] });
            queryClient.invalidateQueries({ queryKey: ['acquired-candidates'] });
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TalentMarketPage;
