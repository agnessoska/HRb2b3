import { useEffect, useRef } from 'react'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useUpdateSessionData } from '../api'
import type { SessionData } from '../types'

interface UseInterviewAutoSaveProps {
  sessionId: string
  sessionData: SessionData
  enabled: boolean
}

export function useInterviewAutoSave({ sessionId, sessionData, enabled }: UseInterviewAutoSaveProps) {
  const debouncedData = useDebouncedValue(sessionData, 3000) // 3 seconds debounce
  const { mutate: updateSession } = useUpdateSessionData()
  const previousDataRef = useRef<string>('')

  useEffect(() => {
    if (!enabled) return

    const currentDataStr = JSON.stringify(debouncedData)
    
    // Skip if data hasn't changed
    if (currentDataStr === previousDataRef.current) return
    
    // Save to localStorage for recovery
    try {
      localStorage.setItem(`interview_session_${sessionId}`, currentDataStr)
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }

    // Save to database
    updateSession(
      { session_id: sessionId, session_data: debouncedData },
      {
        onSuccess: () => {
          previousDataRef.current = currentDataStr
        },
        onError: (error) => {
          console.error('Failed to auto-save:', error)
        },
      }
    )
  }, [debouncedData, sessionId, enabled, updateSession])

  // Cleanup localStorage on unmount
  useEffect(() => {
    return () => {
      try {
        localStorage.removeItem(`interview_session_${sessionId}`)
      } catch (e) {
        console.error('Failed to clean localStorage:', e)
      }
    }
  }, [sessionId])
}