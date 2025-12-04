import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/app/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/shared/lib/supabase';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { getCandidateDashboardData } from '@/features/candidate-management/api/getCandidateDashboardData';
import { getCandidateProfile } from '@/features/candidate-management/api/getCandidateProfile';
import type { CandidateProfile } from '@/features/candidate-management/api/getCandidateProfile';
import { ListContainer, ListItem } from '@/shared/ui/ListTransition';
import type { TDashboardApplication, TDashboardMessage, TDashboardProfile } from '@/features/candidate-management/types';
import { TestList } from '@/features/candidate-management/ui/TestList';


const CandidateDashboardPage = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['candidateDashboard', user?.id],
    queryFn: () => getCandidateDashboardData(user!.id),
    enabled: !!user,
  });

  const { data: fullProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: () => user ? getCandidateProfile(user.id) : Promise.reject('No user'),
    enabled: !!user,
  });

  const handleProfileVisibilityChange = async (isPublic: boolean) => {
    if (!data?.profile?.id) return;
    const { error } = await supabase
      .from('candidates')
      .update({ is_public: isPublic })
      .eq('id', data.profile.id);
    if (error) {
      toast.error(t('profileVisibility.error'));
    } else {
      toast.success(t('profileVisibility.success'));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">
        {t('welcome')}, {isLoading ? '...' : data?.profile?.full_name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActiveApplicationsWidget applications={data?.applications} isLoading={isLoading} />
          <RecentMessagesWidget messages={data?.messages} isLoading={isLoading} />
        </div>
        <div className="space-y-8">
          <ProfileCompletenessWidget profile={fullProfile} isLoading={isProfileLoading} />
          <TestingProgressWidget profile={data?.profile} isLoading={isLoading} />
          <ProfileStatusWidget
            profile={data?.profile}
            onVisibilityChange={handleProfileVisibilityChange}
            isLoading={isLoading}
          />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">{t('testingProgress.title')}</h2>
        <TestList />
      </div>
    </div>
  );
};

// --- WIDGETS ---

const ProfileCompletenessWidget = ({
  profile,
  isLoading,
}: {
  profile: CandidateProfile | undefined;
  isLoading: boolean;
}) => {
  const { t } = useTranslation('dashboard');
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!profile) return null;

  let score = 0;
  if (profile.full_name) score += 10;
  if (profile.phone) score += 10;
  if (profile.category_id) score += 20;
  if (profile.candidate_skills && profile.candidate_skills.length > 0) score += 20;
  if (profile.experience) score += 20;
  if (profile.about) score += 10;
  if (profile.education) score += 10;

  if (score >= 100) return null;

  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <CardTitle className="text-orange-700 dark:text-orange-400">{t('profileCompleteness.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
             <span>{score}%</span>
          </div>
          <Progress value={score} className="h-2 bg-orange-200" indicatorClassName="bg-orange-500" />
          <p className="text-sm text-muted-foreground">{t('profileCompleteness.description')}</p>
          <Button asChild className="w-full" variant="outline">
            <Link to="/candidate/profile">{t('profileCompleteness.completeButton')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const TestingProgressWidget = ({
  profile,
  isLoading,
}: {
  profile: TDashboardProfile | undefined | null;
  isLoading: boolean;
}) => {
  const { t } = useTranslation('dashboard');
  const testsCompleted = profile?.tests_completed || 0;
  const progress = (testsCompleted / 6) * 100;

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
                {t('testingProgress.completed', { count: testsCompleted })}
              </p>
              <p className="font-bold">{Math.round(progress)}%</p>
            </div>
            <Progress value={progress} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ProfileStatusWidget = ({
  profile,
  onVisibilityChange,
  isLoading,
}: {
  profile: TDashboardProfile | undefined | null;
  onVisibilityChange: (isPublic: boolean) => void;
  isLoading: boolean;
}) => {
  const { t } = useTranslation('dashboard');
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
            <Label htmlFor="profile-visibility" className="flex-grow pr-4">
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
  );
};

const ActiveApplicationsWidget = ({
  applications,
  isLoading,
}: {
  applications: TDashboardApplication[] | undefined | null;
  isLoading: boolean;
}) => {
  const { t } = useTranslation('dashboard');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activeApplications.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !applications || applications.length === 0 ? (
          <p className="text-muted-foreground">{t('activeApplications.empty')}</p>
        ) : (
          <ListContainer className="space-y-4">
            {applications.map(app => (
              <ListItem key={app.id}>
                <div className="flex items-center justify-between p-4 bg-muted/30 border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">{app.vacancy_title}</p>
                    <p className="text-sm text-muted-foreground">{app.organization_name}</p>
                  </div>
                  <Badge
                    variant={
                      app.status === 'offer' || app.status === 'hired' ? 'success' :
                      app.status === 'rejected' ? 'destructive' :
                      app.status === 'interview' ? 'warning' :
                      'secondary'
                    }
                    className="text-sm py-1 px-3"
                  >
                    {t(`statuses.${app.status}`)}
                  </Badge>
                </div>
              </ListItem>
            ))}
          </ListContainer>
        )}
      </CardContent>
    </Card>
  );
};

const RecentMessagesWidget = ({
  messages,
  isLoading,
}: {
  messages: TDashboardMessage[] | undefined | null;
  isLoading: boolean;
}) => {
  const { t } = useTranslation('dashboard');
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
          <ListContainer className="space-y-3">
            {messages.map(msg => (
              <ListItem key={msg.id} className="text-sm">
                <span className="font-semibold">
                  {msg.sender_type === 'hr'
                    ? msg.hr_specialist_name || t('hrSpecialist')
                    : t('you')}
                  :
                </span>{' '}
                <span className="text-muted-foreground truncate">{msg.message_text}</span>
              </ListItem>
            ))}
          </ListContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateDashboardPage;
