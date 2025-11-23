import type { Database } from './database';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Test = Tables<'tests'>;
export type TestQuestion = Tables<'test_questions'>;
export type TestScale = Tables<'test_scales'>;

export type TestWithQuestions = Test & {
  test_questions: TestQuestion[];
  test_scales: TestScale[];
};