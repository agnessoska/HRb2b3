import type { Database } from '@/shared/types/database'

export type TAiOperation =
  Database['public']['Tables']['ai_operations_log']['Row']

export interface AnalysisCandidate {
  name: string
  match_score: number
  summary: string
  pros: string[]
  cons: string[]
  skills?: {
    hard_skills_match: string[]
    missing_skills: string[]
    soft_skills: string[]
  }
  cultural_fit?: string
  red_flags?: string[]
  interview_questions?: string[]
  verdict: 'recommended' | 'maybe' | 'rejected'
  vacancy_matches: {
    vacancy_title: string
    score: number
    reason: string
  }[]
}

export interface AnalysisData {
  candidates: AnalysisCandidate[]
}

export interface AnalysisResult {
  id: string
  created_at: string
  content_html: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis_data: any
}
