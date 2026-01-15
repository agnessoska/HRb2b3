import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from '@/shared/ui/HelpCircle';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';
import i18n from '@/shared/lib/i18n';


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
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-3xl font-bold">
          {t('welcome')}, {isLoading ? '...' : data?.profile?.full_name}
        </h1>
        <HelpCircle topicId="candidate_dashboard" />
      </div>

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

  const fields = [
    { key: 'full_name', value: profile.full_name, weight: 10 },
    { key: 'phone', value: profile.phone, weight: 10 },
    { key: 'category', value: profile.category_id, weight: 20 },
    { key: 'skills', value: profile.candidate_skills && profile.candidate_skills.length > 0, weight: 20 },
    { key: 'experience', value: profile.experience, weight: 20 },
    { key: 'about', value: profile.about, weight: 10 },
    { key: 'education', value: profile.education, weight: 10 },
  ];

  const score = fields.reduce((acc, field) => (field.value ? acc + field.weight : acc), 0);
  const missingFields = fields.filter(f => !f.value);

  if (score >= 100) return null;

  return (
    <Card className="border-orange-500/20 bg-orange-500/10 dark:bg-orange-500/5 overflow-hidden shadow-xl shadow-orange-500/10 rounded-[2rem] backdrop-blur-xl">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-orange-700 dark:text-orange-400 flex justify-between items-center text-xl font-black">
          {t('profileCompleteness.title')}
          <span className="text-2xl font-bold">{score}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-4 space-y-6">
        <Progress value={score} className="h-3 bg-orange-200 dark:bg-orange-950/30" indicatorClassName="bg-orange-500" />
        
        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-orange-800/70 dark:text-orange-300/70 uppercase tracking-wider">
              {t('profileCompleteness.description')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingFields.map(field => (
                <Badge 
                  key={field.key} 
                  variant="outline" 
                  className="bg-white/50 dark:bg-orange-500/10 border-orange-200/50 text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-colors cursor-default py-0.5 text-[10px]"
                >
                  + {t(`profileCompleteness.fields.${field.key}`)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20" variant="outline">
          <Link to="/candidate/profile">{t('profileCompleteness.completeButton')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

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
    <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-primary/5">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black tracking-tight">{t('testingProgress.title')}</CardTitle>
          <HelpCircle topicId="candidate_tests_importance" iconClassName="opacity-50" />
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-4">
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
    <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-primary/5">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black tracking-tight">{t('profileVisibility.title')}</CardTitle>
          <HelpCircle topicId="candidate_profile_publicity" iconClassName="opacity-50" />
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-4">
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
    <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-primary/5">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-2xl font-black tracking-tighter">{t('activeApplications.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-4">
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
  const currentLocale = i18n.language === 'kk' ? kk : i18n.language === 'en' ? enUS : ru;

  return (
    <Card className="overflow-hidden border-border/50 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-primary/5 p-8">
        <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          {t('recentMessages.title')}
          {t('recentMessages.title')}
          {messages && messages.length > 0 && (
            <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px]">
              {messages.length}
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
          <Link to="/candidate/chat">{t('recentMessages.button')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-muted-foreground font-medium">{t('recentMessages.empty')}</p>
          </div>
        ) : (
          <ListContainer>
            {messages.slice(0, 3).map((msg, index) => (
              <ListItem 
                key={msg.id} 
                className={`group transition-all hover:bg-muted/30 ${index !== Math.min(messages.length, 3) - 1 ? 'border-b' : ''}`}
              >
                <Link to="/candidate/chat" className="flex items-start gap-5 p-6 w-full group/msg">
                  <Avatar className="h-12 w-12 border-4 border-background shadow-lg shrink-0 transition-transform group-hover/msg:scale-110 duration-300">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className={msg.sender_type === 'hr' ? "bg-primary/10 text-primary font-black" : "bg-orange-100 text-orange-600 font-black"}>
                      {msg.sender_type === 'hr' 
                        ? (msg.hr_specialist_name?.[0] || 'H') 
                        : (t('you')[0])}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                        {msg.sender_type === 'hr'
                          ? msg.hr_specialist_name || t('hrSpecialist')
                          : t('you')}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { 
                          addSuffix: true, 
                          locale: currentLocale 
                        }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 break-words leading-relaxed">
                      {msg.message_text}
                    </p>
                  </div>
                </Link>
              </ListItem>
            ))}
          </ListContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateDashboardPage;
