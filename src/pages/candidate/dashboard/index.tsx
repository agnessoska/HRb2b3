import { useQuery } from '@tanstack/react-query'
import { getTests } from '@/features/testing-system/api/getTests'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/app/store/auth'
import { getCandidateProfile } from '@/features/candidate-management/api/getCandidateProfile'
import { getActiveApplications } from '@/features/candidate-management/api/getActiveApplications'
import { getRecentChatMessages } from '@/features/chat/api/getRecentChatMessages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { supabase } from '@/shared/lib/supabase'
import { toast } from 'sonner'
import type { TActiveApplication } from '@/features/candidate-management/types'
import type { ChatMessage } from '@/features/chat/types'
import type { TUser } from '@/shared/types/user'
import { Badge } from '@/components/ui/badge'

const CandidateDashboardPage = () => {
  const { t } = useTranslation('dashboard')
  const { user } = useAuthStore()

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: () => getCandidateProfile(user!.id),
    enabled: !!user,
  })

  const { isLoading: isTestsLoading } = useQuery({
    queryKey: ['tests', user?.id],
    queryFn: () => getTests(user!.id),
    enabled: !!user,
  })

  const { data: applications, isLoading: isAppsLoading } = useQuery({
    queryKey: ['activeApplications', profile?.id],
    queryFn: () => getActiveApplications(profile!.id),
    enabled: !!profile,
  })

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['recentMessages', profile?.id],
    queryFn: () => getRecentChatMessages(profile!.id),
    enabled: !!profile,
  })

  const handleProfileVisibilityChange = async (isPublic: boolean) => {
    if (!profile) return
    const { error } = await supabase
      .from('candidates')
      .update({ is_public: isPublic })
      .eq('id', profile.id)
    if (error) {
      toast.error(t('profileVisibility.error'))
    } else {
      toast.success(t('profileVisibility.success'))
    }
  }

  const isLoading =
    isProfileLoading || isTestsLoading || isAppsLoading || isMessagesLoading

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">
        {t('welcome')}, {profile?.full_name || '...'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActiveApplicationsWidget
            applications={applications}
            isLoading={isLoading}
          />
          <RecentMessagesWidget messages={messages} isLoading={isLoading} />
        </div>
        <div className="space-y-8">
          <TestingProgressWidget
            profile={profile}
            isLoading={isLoading}
          />
          <ProfileStatusWidget
            profile={profile}
            onVisibilityChange={handleProfileVisibilityChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

// --- WIDGETS ---

const TestingProgressWidget = ({
  profile,
  isLoading,
}: {
  profile: TUser['candidate'] | null | undefined
  isLoading: boolean
}) => {
  const { t } = useTranslation('dashboard')
  const testsCompleted = profile?.tests_completed || 0
  const progress = (testsCompleted / 6) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('testingProgress.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">
                {t('testingProgress.completed', {
                  count: testsCompleted,
                })}
              </p>
              <p className="font-bold">{Math.round(progress)}%</p>
            </div>
            <Progress value={progress} />
            <Button asChild className="w-full mt-4">
              <Link to="/candidate/tests">{t('testingProgress.button')}</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

const ProfileStatusWidget = ({
  profile,
  onVisibilityChange,
  isLoading,
}: {
  profile: TUser['candidate'] | null | undefined
  onVisibilityChange: (isPublic: boolean) => void
  isLoading: boolean
}) => {
  const { t } = useTranslation('dashboard')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profileVisibility.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-visibility" className="flex-grow">
              {t('profileVisibility.label')}
            </Label>
            <Switch
              id="profile-visibility"
              defaultChecked={profile?.is_public}
              onCheckedChange={onVisibilityChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const ActiveApplicationsWidget = ({
  applications,
  isLoading,
}: {
  applications: TActiveApplication[] | undefined
  isLoading: boolean
}) => {
  const { t } = useTranslation('dashboard')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activeApplications.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !applications || applications.length === 0 ? (
          <p className="text-muted-foreground">
            {t('activeApplications.empty')}
          </p>
        ) : (
          <ul className="space-y-4">
            {applications.map(app => (
              <li
                key={app.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-semibold">{app.vacancies.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.vacancies.organizations.name}
                  </p>
                </div>
                <Badge>{t(`statuses.${app.status}`)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

const RecentMessagesWidget = ({
  messages,
  isLoading,
}: {
  messages: ChatMessage[] | undefined
  isLoading: boolean
}) => {
  const { t } = useTranslation('dashboard')
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('recentMessages.title')}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidate/chat">{t('recentMessages.button')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !messages || messages.length === 0 ? (
          <p className="text-muted-foreground">{t('recentMessages.empty')}</p>
        ) : (
          <ul className="space-y-3">
            {messages.map(msg => (
              <li key={msg.id} className="text-sm">
                <span className="font-semibold">
                  {msg.sender_type === 'hr'
                    ? ((
                        msg as unknown as {
                          chat_rooms: { hr_specialists: { full_name: string } }
                        }
                      ).chat_rooms)?.hr_specialists?.full_name ||
                      t('hrSpecialist')
                    : t('you')}
                  :
                </span>{' '}
                <span className="text-muted-foreground">
                  {msg.message_text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default CandidateDashboardPage
