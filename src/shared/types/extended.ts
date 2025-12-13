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

export type Candidate = Tables<'candidates'>;

export type CandidateWithVacancies = Candidate & {
  vacancy_ids: string[];
  category_name_ru: string | null;
  category_name_en: string | null;
  category_name_kk: string | null;
};

// Application with extended tracking fields
export type Application = Tables<'applications'>;

export type ApplicationWithCandidate = Application & {
  candidate: Candidate & {
    tests_completed: number;
    category_name_ru: string | null;
    category_name_en: string | null;
    category_name_kk: string | null;
  };
};

// Extended application for smart funnel
export type SmartApplication = ApplicationWithCandidate & {
  has_full_analysis: boolean;
  latest_interview_id: string | null;
  interview_recommendation: 'hire_strongly' | 'hire' | 'consider' | 'reject' | null;
  sent_documents: string[];
};