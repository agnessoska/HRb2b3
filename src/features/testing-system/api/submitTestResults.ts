import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/app/store/auth';
import type { Json } from '@/shared/types/database';
import { getCandidateProfileByUserId } from '@/features/candidate-management/api/getCandidateProfileByUserId';

interface SubmitTestPayload {
  testId: string;
  answers: Record<string, number | string>;
}

interface TestResult {
  raw_scores: Json;
  normalized_scores: Json;
  detailed_result: string | null;
}

export const submitTestResults = async ({ testId, answers }: SubmitTestPayload) => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    throw new Error('User is not authenticated');
  }

  const profile = await getCandidateProfileByUserId(userId);
  if (!profile) {
    throw new Error('Candidate profile not found for the current user.');
  }
  const candidateId = profile.id;

  // 1. Calculate results using the RPC function
  const { data, error: rpcError } = await supabase.rpc('calculate_test_results', {
    p_test_id: testId,
    p_answers: answers,
  });

  if (rpcError) {
    console.error('Error calculating test results:', rpcError);
    throw rpcError;
  }

  const resultData = data as unknown as TestResult;

  // 2. Save the results to the table
  const { data: submissionData, error: insertError } = await supabase
    .from('candidate_test_results')
    .insert({
      candidate_id: candidateId, // Use the correct profile ID
      test_id: testId,
      answers: answers,
      raw_scores: resultData?.raw_scores,
      normalized_scores: resultData?.normalized_scores,
      detailed_result: resultData?.detailed_result,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error saving test results:', insertError);
    throw insertError;
  }

  return submissionData;
};
