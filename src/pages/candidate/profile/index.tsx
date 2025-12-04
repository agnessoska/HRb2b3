import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/shared/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getCandidateProfile } from '@/features/candidate-management/api/getCandidateProfile'
import { CandidateProfileForm } from '@/features/candidate-management/ui/CandidateProfileForm'
import { Loader2 } from 'lucide-react'

export default function CandidateProfilePage() {
  const { t } = useTranslation('candidates')
  const { user } = useAuth()

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: () => user ? getCandidateProfile(user.id) : Promise.reject('No user'),
    enabled: !!user,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('profile.title', 'Мой профиль')}</h1>
      </div>

      <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>{t('profile.personalInfo', 'Личная информация')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : profile ? (
            <CandidateProfileForm initialData={profile} onUpdate={refetch} />
          ) : (
            <div className="text-center text-muted-foreground p-8">
              {t('profile.notFound', 'Профиль не найден')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
