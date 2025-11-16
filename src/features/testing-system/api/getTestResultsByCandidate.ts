import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/app/store/auth';
import type { Tables } from '@/shared/types/database';

export const getTestResultsByCandidate = async (): Promise<Tables<'candidate_test_results'>[] | null> => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return null;

  // We need the profile to get the candidate_id, which is different from user_id
  const { data: profile, error: profileError } = await supabase
    .from('candidates')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching candidate profile for results:', profileError);
    return null;
  }

  const { data, error } = await supabase
    .from('candidate_test_results')
    .select('*')
    .eq('candidate_id', profile.id);

  if (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }

  return data;
};
