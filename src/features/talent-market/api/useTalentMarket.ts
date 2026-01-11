import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import type { MarketFilters } from "../ui/TalentMarketFilters";
import { useAuthStore } from "@/app/store/auth";
import type { TalentMarketCandidate } from "../types";
import { useTranslation } from "react-i18next";

const PAGE_LIMIT = 20;

export const useTalentMarket = (filters: MarketFilters) => {
  const { user } = useAuthStore();
  const { i18n } = useTranslation();

  return useInfiniteQuery({
    queryKey: ['talent-market', filters, i18n.language],
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
        
        if (scoreError) {
          console.error('Error fetching candidate scores:', scoreError);
          return [];
        }
        
        const scored = scoredCandidates as unknown as TalentMarketCandidate[];
        return scored.map(c => {
          const rawCandidateSkills = c.skills as unknown as { name?: string; canonical_name?: string; canonical_skill?: string }[];
          return {
            ...c,
            skills: Array.isArray(rawCandidateSkills) ? rawCandidateSkills.map(s => ({
              name: s.name || s.canonical_name || s.canonical_skill || '',
              canonical_name: s.canonical_name || s.canonical_skill || ''
            })) : []
          };
        }) as TalentMarketCandidate[];
      }

      let query = supabase
        .from('candidates')
        .select(`
          id,
          full_name,
          category:professional_categories(id, name_ru, name_en, name_kk),
          tests_completed,
          tests_last_updated_at,
          skills:candidate_skills(
            canonical_skill
          ),
          avatar_url
        `)
        .eq('is_public', true)
        .range(offset, offset + PAGE_LIMIT - 1);

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.minTestsCompleted > 0) {
        query = query.gte('tests_completed', filters.minTestsCompleted);
      }
      
      if (filters.sortBy === 'date') {
        query = query.order('created_at', { ascending: false });
      } else if (filters.sortBy === 'tests') {
        query = query.order('tests_completed', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: candidates, error } = await query;
      if (error) throw error;

      return candidates.map(c => {
        const rawSkills = c.skills as unknown as { canonical_skill: string }[];
        
        return {
          candidate_id: c.id,
          full_name: c.full_name ?? '',
          category_id: c.category?.id ?? null,
          tests_completed: c.tests_completed,
          tests_last_updated_at: c.tests_last_updated_at ?? new Date().toISOString(),
          professional_compatibility: 0,
          personal_compatibility: 0,
          overall_compatibility: 0,
          compatibility_details: null,
          skills: rawSkills?.map(s => ({
            name: s.canonical_skill, // Fallback to canonical name since we can't join directly without FK
            canonical_name: s.canonical_skill
          })) ?? [],
          category: c.category,
          avatar_url: c.avatar_url,
        };
      }) as TalentMarketCandidate[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_LIMIT) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: !!user,
    staleTime: 0,
  });
};
