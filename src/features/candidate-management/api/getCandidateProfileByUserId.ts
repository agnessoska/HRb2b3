import { supabase } from '@/shared/lib/supabase';
import type { Tables } from '@/shared/types/database';

export const getCandidateProfileByUserId = async (userId: string): Promise<Tables<'candidates'> | null> => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching candidate profile by user id:', error);
    // It's okay if no profile is found, so we don't throw an error here.
    return null;
  }

  return data;
};
