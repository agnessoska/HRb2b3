import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { InterviewSessionWithData } from '../types'

async function getInterviewSessionsByCandidate(candidateId: string): Promise<InterviewSessionWithData[]> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []) as unknown as InterviewSessionWithData[]
}

export function useGetInterviewSessions(candidateId: string) {
  return useQuery({
    queryKey: ['interview-sessions', candidateId],
    queryFn: () => getInterviewSessionsByCandidate(candidateId),
    enabled: !!candidateId,
  })
}

async function getInterviewSessionById(sessionId: string): Promise<InterviewSessionWithData> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Interview session not found')
  }

  return data as unknown as InterviewSessionWithData
}

export function useGetInterviewSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['interview-session', sessionId],
    queryFn: () => getInterviewSessionById(sessionId!),
    enabled: !!sessionId,
  })
}