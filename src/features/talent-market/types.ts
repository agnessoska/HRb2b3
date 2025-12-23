import type { Json } from "@/shared/types/database";

export type ScoredCandidate = {
  candidate_id: string; // From RPC
  id?: string; // From table direct select
  full_name: string | null;
  category_id?: string | null;
  tests_completed: number;
  tests_last_updated_at: string | null;
  professional_compatibility: number;
  personal_compatibility: number;
  overall_compatibility: number;
  compatibility_details: Json;
  skills: Json;
  category: Json;
  avatar_url?: string | null;
};

// A candidate in the talent market can be from the scoring RPC (with candidate_id)
// or a direct query (with id). We'll unify them here.
export type TalentMarketCandidate = Partial<ScoredCandidate> & {
  id?: string;
  candidate_id?: string;
  full_name: string | null;
  avatar_url?: string | null;
};
