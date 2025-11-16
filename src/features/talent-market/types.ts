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

export type UnscoredCandidate = {
  id: string;
  full_name: string | null;
  category: { id: string; name_ru: string } | null;
  tests_completed: number;
  tests_last_updated_at: string | null;
  skills: { canonical_skill: string }[];
  compatibility: null;
};

export type TalentMarketCandidate = ScoredCandidate | UnscoredCandidate;
