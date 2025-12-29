import type { Database } from '@/shared/types/database'

// Database types
export type InterviewSession = Database['public']['Tables']['interview_sessions']['Row']
export type InterviewSessionInsert = Database['public']['Tables']['interview_sessions']['Insert']
export type InterviewSessionUpdate = Database['public']['Tables']['interview_sessions']['Update']

// Interview Plan Structure (from AI)
export interface InterviewPlanItem {
  type: 'script' | 'ice_breaker' | 'question' | 'risk_check' | 'strength_check' | 'candidate_questions'
  
  // Common fields
  content?: string
  question?: string
  notes_placeholder?: string
  
  // Question-specific
  category?: string
  what_to_listen_for?: string
  red_flags?: string[]
  rating_enabled?: boolean
  
  // Risk/Strength specific
  risk_description?: string
  strength_description?: string
  
  // Candidate questions specific
  expected_questions?: string[]
}

export interface InterviewSection {
  id: string
  title: string
  time_allocation: number
  description: string
  focus?: 'critical' | 'important' | 'standard'
  items: InterviewPlanItem[]
}

export interface InterviewPlan {
  candidate_name: string
  vacancy_title: string
  estimated_duration: number
  sections: InterviewSection[]
}

// Session Data Structure (user input during interview)
export interface SessionNotes {
  [itemKey: string]: string  // e.g., "intro-0": "Candidate was energetic..."
}

export interface SessionRatings {
  [itemKey: string]: number  // e.g., "experience-0": 5 (1-5 stars)
}

export interface SessionProgress {
  current_section: string
  sections_completed: string[]
}

export interface SessionCompletion {
  overall_impression: string
  recommendation: 'hire_strongly' | 'hire' | 'consider' | 'reject'
  completed_by: string
  completed_at: string
}

export interface SessionData {
  notes: SessionNotes
  ratings: SessionRatings
  completed_items: string[]  // Array of item keys: ["intro-0", "experience-1"]
  progress: SessionProgress
  completion?: SessionCompletion
}

// Extended type with parsed JSON
export interface InterviewSessionWithData extends Omit<InterviewSession, 'interview_plan' | 'session_data'> {
  interview_plan: InterviewPlan;
  session_data: SessionData;
  total_tokens?: number;
}

// Helper to generate item key
export function getItemKey(sectionId: string, itemIndex: number): string {
  return `${sectionId}-${itemIndex}`
}

// Helper to check if item is completed
export function isItemCompleted(sessionData: SessionData, itemKey: string): boolean {
  return sessionData.completed_items.includes(itemKey)
}

// Helper to get progress percentage
export function getProgressPercentage(sessionData: SessionData, totalItems: number): number {
  if (totalItems === 0) return 0;
  return Math.round((sessionData.completed_items.length / totalItems) * 100)
}

// Helper to count total items (only interactive items with checkboxes, exclude 'script')
export function countTotalItems(plan: InterviewPlan): number {
  return plan.sections.reduce((acc, section) => {
    const interactiveItems = section.items.filter(item => item.type !== 'script')
    return acc + interactiveItems.length
  }, 0)
}