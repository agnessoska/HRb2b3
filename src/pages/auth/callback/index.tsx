import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/lib/supabase'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/app/store/auth'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          setUser(session.user)
          
          // Check if user has a profile (HR or Candidate)
          // We can check hr_specialists table first
          const { data: hrProfile } = await supabase
            .from('hr_specialists')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (hrProfile) {
            navigate('/hr/dashboard')
            return
          }

          // Check candidates table
          const { data: candidateProfile } = await supabase
            .from('candidates')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (candidateProfile) {
            navigate('/candidate/dashboard')
            return
          }

          // If no profile found, redirect to onboarding
          navigate('/auth/onboarding')
        } else {
          // If no session, redirect to login
          navigate('/auth/login')
        }
      } catch (error) {
        console.error('Error during auth callback:', error)
        toast.error(t('authError'))
        navigate('/auth/login')
      }
    }

    handleCallback()
  }, [navigate, setUser, t])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}