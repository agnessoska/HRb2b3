import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/shared/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getCandidateProfile } from '@/features/candidate-management/api/getCandidateProfile'
import { CandidateProfileForm } from '@/features/candidate-management/ui/CandidateProfileForm'
import { Loader2, ChevronLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { HelpCircle } from '@/shared/ui/HelpCircle'

export default function CandidateProfilePage() {
  const { t } = useTranslation(['candidates', 'common'])
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formState, setFormState] = useState({ isDirty: false, loading: false })

  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDirty: boolean, loading: boolean }>
      setFormState(customEvent.detail)
    }
    window.addEventListener('profile-form-state', handleStateChange)
    return () => window.removeEventListener('profile-form-state', handleStateChange)
  }, [])

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: () => user ? getCandidateProfile(user.id) : Promise.reject('No user'),
    enabled: !!user,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('profile.title', 'Мой профиль')}</h1>
            <HelpCircle topicId="candidate_profile_publicity" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default"
            size="lg"
            className="rounded-xl font-bold shadow-md shadow-primary/10 transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            disabled={formState.loading || !formState.isDirty}
            onClick={() => document.getElementById('candidate-profile-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
          >
            {formState.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t('save', { ns: 'common' })}
          </Button>
        </div>
      </div>

      <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg font-bold">{t('profile.personalInfo', 'Личная информация')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : profile ? (
            <CandidateProfileForm initialData={profile} onUpdate={refetch} />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              {t('profile.notFound', 'Профиль не найден')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
