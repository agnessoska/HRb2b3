import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { SessionData, InterviewSessionWithData } from '../types'

interface UpdateSessionDataPayload {
  session_id: string
  session_data: SessionData
}

async function updateSessionData(payload: UpdateSessionDataPayload) {
  const { data, error } = await supabase.rpc('update_interview_session_data', {
    p_session_id: payload.session_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p_session_data: payload.session_data as any,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !(data as { success: boolean }).success) {
    throw new Error((data as { error?: string })?.error || 'Failed to update session')
  }

  return data
}

export function useUpdateSessionData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSessionData,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', variables.session_id] })
    },
  })
}

interface CompleteSessionPayload {
  session_id: string
  overall_impression: string
  recommendation: 'hire_strongly' | 'hire' | 'consider' | 'reject'
}

async function completeSession(payload: CompleteSessionPayload) {
  const { data, error } = await supabase.rpc('complete_interview_session', {
    p_session_id: payload.session_id,
    p_overall_impression: payload.overall_impression,
    p_recommendation: payload.recommendation,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !(data as { success: boolean }).success) {
    throw new Error((data as { error?: string })?.error || 'Failed to complete session')
  }

  return data
}

export function useCompleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeSession,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', variables.session_id] })
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] })
    },
  })
}

// Start interview session (change status from planned to in_progress)
async function startSession(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export function useStartSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startSession,
    // Optimistic update
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: ['interview-session', sessionId] })
      
      const previousSession = queryClient.getQueryData<InterviewSessionWithData>(['interview-session', sessionId])
      
      if (previousSession) {
        queryClient.setQueryData<InterviewSessionWithData>(['interview-session', sessionId], {
          ...previousSession,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
      }
      
      return { previousSession }
    },
    // Rollback on error
    onError: (_err, sessionId, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(['interview-session', sessionId], context.previousSession)
      }
    },
    // Refetch on success
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] })
    },
  })
}