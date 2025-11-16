import { supabase } from '@/shared/lib/supabase';
import type { Tables } from '@/shared/types/database';
import { getTestResultsByCandidate } from './getTestResultsByCandidate';

export type TestWithResult = Tables<'tests'> & {
  result: Tables<'candidate_test_results'> | null;
};

export const getTests = async (userId: string): Promise<TestWithResult[]> => {
  const { data: tests, error: testsError } = await supabase
    .from('tests')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (testsError) {
    console.error('Error fetching tests:', testsError);
    throw testsError;
  }

  const results = await getTestResultsByCandidate(userId);

  const testsWithResults = tests.map((test) => {
    const result = results?.find((r) => r.test_id === test.id) || null;
    return { ...test, result };
  });

  return testsWithResults;
};
