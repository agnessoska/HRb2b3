import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import type { MarketFilters } from "../ui/TalentMarketFilters";
import { useAuthStore } from "@/app/store/auth";

const PAGE_LIMIT = 20;

export const useTalentMarket = (filters: MarketFilters) => {
  const { user } = useAuthStore();

  return useInfiniteQuery({
    queryKey: ['talent-market', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * PAGE_LIMIT;

      if (filters.vacancyId) {
        const { data: scoredCandidates, error: scoreError } = await supabase.rpc(
          'get_candidate_compatibility_scores',
          {
            p_vacancy_id: filters.vacancyId,
            p_limit: PAGE_LIMIT,
            p_offset: offset
          }
        );
        if (scoreError) throw scoreError;
        return scoredCandidates;
      }

      let query = supabase
        .from('candidates')
        .select(`
          id,
          full_name,
          category:professional_categories(id, name_ru),
          tests_completed,
          tests_last_updated_at,
          skills:candidate_skills(canonical_skill)
        `)
        .eq('is_public', true)
        .range(offset, offset + PAGE_LIMIT - 1);

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.minTestsCompleted > 0) {
        query = query.gte('tests_completed', filters.minTestsCompleted);
      }
      
      const { data: candidates, error } = await query;
      if (error) throw error;

      return candidates.map(c => ({
        candidate_id: c.id,
        full_name: c.full_name ?? '',
        category_id: c.category?.id ?? null,
        tests_completed: c.tests_completed,
        tests_last_updated_at: c.tests_last_updated_at ?? new Date().toISOString(),
        professional_compatibility: 0,
        personal_compatibility: 0,
        overall_compatibility: 0,
        compatibility_details: null,
        skills: c.skills,
        category: c.category,
      }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_LIMIT) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: !!user,
  });
};
