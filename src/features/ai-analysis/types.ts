// Типы для анализа резюме
export interface AnalysisData {
  candidates: AnalysisCandidate[]
}

export interface AnalysisCandidate {
  name: string
  email?: string
  phone?: string
  verdict: 'recommended' | 'maybe' | 'rejected'
  matches: Array<{
    vacancy: string
    score: number
  }>
  hard_skills: string[]
  soft_skills: string[]
  gaps: string[]
  red_flags: string[]
  cultural_fit: string
  interview_questions: string[]
}

export interface AnalysisResult {
  id: string
  created_at: string
  organization_id: string
  created_by_hr_id: string
  vacancy_ids: string[] | null
  resume_count: number
  content_markdown: string | null
  content_html: string | null
  analysis_data: AnalysisData | null
}

// Типы для сравнения кандидатов
export interface ComparisonScores {
  professional: number
  personality: number
  cultural_fit: number
  motivation: number
}

export interface RankedCandidate {
  candidate_id: string
  rank: number
  overall_score: number
  scores: ComparisonScores
  strengths: string[]
  weaknesses: string[]
  key_insights: string
  recommendation: 'hire_strongly' | 'hire' | 'consider' | 'reject'
}

export interface ComparisonMatrix {
  criteria: string[]
  candidates: Array<{
    candidate_id: string
    scores: number[]
  }>
}

export interface FinalRecommendation {
  best_fit: string
  reasoning: string
  alternatives: string[]
  red_flags: string[]
}

export interface ComparisonData {
  summary: string
  ranked_candidates: RankedCandidate[]
  comparison_matrix: ComparisonMatrix
  final_recommendation: FinalRecommendation
}

export interface ComparisonResult {
  id: string
  created_at: string
  organization_id: string
  vacancy_id: string
  created_by_hr_id: string
  candidate_ids: string[]
  content_markdown: string
  content_html: string
  ranking: ComparisonData
}

// Типы для генерируемых документов
export interface InterviewInvitationData {
  greeting: string
  introduction: string
  interview_details: {
    format: string
    estimated_duration: string
    stages: string[]
  }
  preparation_checklist: string[]
  what_to_expect: string
  next_steps: string
  contact_info: string
  closing: string
}

export interface JobOfferData {
  congratulations: string
  opening_statement: string
  position_details: {
    title: string
    employment_type: string
    start_date: string
    probation_period: string
  }
  compensation_package: {
    salary: string
    bonuses: string[]
    benefits: string[]
  }
  key_responsibilities: string[]
  growth_opportunities: string
  team_info: string
  decision_deadline: string
  next_steps: string
  closing: string
}

export interface RejectionLetterData {
  greeting: string
  gratitude: string
  decision_statement: string
  positive_feedback: string
  encouragement: string
  future_opportunities: string
  wishes: string
  closing: string
  company_regards: string
}

export type GeneratedDocumentData = InterviewInvitationData | JobOfferData | RejectionLetterData

export interface GeneratedDocumentResult {
  id: string
  created_at: string
  updated_at: string | null
  organization_id: string
  candidate_id: string
  vacancy_id: string | null
  created_by_hr_id: string
  document_type: 'interview_invitation' | 'job_offer' | 'rejection_letter' | 'structured_interview'
  title: string
  content_markdown: string | null
  content_html: string | null
  is_public: boolean
  document_data: GeneratedDocumentData | null
}
