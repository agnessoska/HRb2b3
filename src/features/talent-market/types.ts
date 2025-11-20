import type { Json } from "@/shared/types/database";

export type ScoredCandidate = {
  candidate_id: string;
  full_name: string | null;
  category_id?: string | null; // Made optional
  tests_completed: number;
  tests_last_updated_at: string | null;
  professional_compatibility: number;
  personal_compatibility: number;
  overall_compatibility: number;
  compatibility_details: Json;
  skills: Json;
  category: Json;
};

// Unscored candidates are mapped to match ScoredCandidate structure in the API hook
export type TalentMarketCandidate = ScoredCandidate;
