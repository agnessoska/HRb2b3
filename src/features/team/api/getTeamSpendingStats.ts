import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useOrganization } from '@/shared/hooks/useOrganization';

export interface TeamSpendingStat {
  id: string;
  full_name: string;
  ai_tokens: number;
  invite_tokens: number;
  market_tokens: number;
  total_spent: number;
}

export const useGetTeamSpendingStats = () => {
  const { data: organization } = useOrganization();

  return useQuery({
    queryKey: ['teamSpendingStats', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase.rpc('get_team_spending_stats', {
        p_organization_id: organization.id,
      });

      if (error) throw error;
      return data as TeamSpendingStat[];
    },
    enabled: !!organization?.id,
  });
};