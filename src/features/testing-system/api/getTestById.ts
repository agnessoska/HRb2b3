import { supabase } from '@/shared/lib/supabase';
import type { TestWithQuestions } from '@/shared/types/extended';

export const getTestById = async (testId: string): Promise<TestWithQuestions | null> => {
  const { data, error } = await supabase
    .from('tests')
    .select(
      `
      *,
      test_questions (*),
      test_scales (*)
    `
    )
    .eq('id', testId)
    .order('question_number', { foreignTable: 'test_questions', ascending: true })
    .single();

  if (error) {
    console.error('Error fetching test by id:', error);
    throw error;
  }

  return data as TestWithQuestions;
};
