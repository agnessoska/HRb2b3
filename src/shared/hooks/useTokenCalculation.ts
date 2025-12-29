import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useOrganization } from './useOrganization';
import type { Database } from '@/shared/types/database';

export type OperationType =
  | 'resume_analysis'
  | 'candidate_comparison'
  | 'ideal_profile_generation'
  | 'interview_invitation'
  | 'rejection_letter'
  | 'structured_interview'
  | 'create_invitation_token'
  | 'acquire_candidate_from_market'
  | 'hr_invitation';

export type OperationConfig = Database['public']['Functions']['get_ai_operation_configs']['Returns'][number];

export const useTokenCalculation = (operationType: OperationType, inputString?: string, multiplier: number = 1) => {
  const { data: organization } = useOrganization();
  const currentBalance = organization?.token_balance || 0;

  const { data: configs, isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['ai-operation-configs'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_ai_operation_configs');
      if (error) throw error;
      return data as OperationConfig[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const config = configs?.find(c => c.operation_type === operationType);

  const calculation = (() => {
    if (!config) return null;

    if (!config.is_ai) {
      const cost = (config.fixed_cost || 0) * multiplier;
      return {
        isAI: false,
        expectedCost: cost,
        maxCost: cost,
        hasEnough: currentBalance >= cost,
        balanceAfter: currentBalance - cost
      };
    }

    // AI Calculation
    // Estimate input tokens: 1 token per 3 characters for Cyrillic/Mixed
    const inputTokensEstimate = inputString ? Math.ceil(inputString.length / 3) : 500; // 500 default for system prompt
    const maxOutput = config.max_output_tokens || 2000;
    
    const maxCost = (inputTokensEstimate + maxOutput) * multiplier;
    // Expected cost is roughly input + 40% of max output
    const expectedCost = (inputTokensEstimate + Math.ceil(maxOutput * 0.4)) * multiplier;

    return {
      isAI: true,
      expectedCost,
      maxCost,
      hasEnough: currentBalance >= maxCost,
      balanceAfter: currentBalance - expectedCost,
      maxBalanceAfter: currentBalance - maxCost,
      modelInfo: {
        name: config.model_name,
        provider: config.provider
      }
    };
  })();

  return {
    calculation,
    isLoading: isLoadingConfigs,
    currentBalance
  };
};