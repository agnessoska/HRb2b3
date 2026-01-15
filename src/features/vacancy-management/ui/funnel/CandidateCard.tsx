import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/shared/lib/supabase';
import { toast } from 'sonner';
import {
  User,
  MessageSquare,
  MoreHorizontal,
  FileText,
  ArrowRightLeft,
  CheckCircle,
  Calendar,
  PlayCircle,
  Trophy,
  X,
  Sparkles,
  Users,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SmartApplication } from '@/shared/types/extended';
import { HelpCircle } from '@/shared/ui/HelpCircle';

interface CandidateCardProps {
  application: SmartApplication;
  onStatusChange?: (action: string, applicationId?: string) => void;
  onInviteToInterview?: (applicationId: string) => void;
  onMoveToOffer?: (applicationId: string) => void;
  onOpenInterview?: (sessionId: string) => void;
}

export const CandidateCard = ({
  application,
  onStatusChange,
  onInviteToInterview,
  onMoveToOffer,
  onOpenInterview,
}: CandidateCardProps) => {
  const { t, i18n } = useTranslation(['funnel', 'tests', 'common']);
  const navigate = useNavigate();
  const lang = i18n.language as 'ru' | 'kk' | 'en';

  const categoryName = application.candidate[`category_name_${lang}`];
  const testsCompleted = application.candidate.tests_completed || 0;

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = application.candidate.avatar_url;

  // Dynamic badges based on status
  const renderDynamicBadges = () => {
    const badges = [];

    // 1. Tests progress (for invited/testing)
    if (application.status === 'invited' && testsCompleted === 0) {
      badges.push(
        <Badge key="waiting" variant="secondary" className="gap-1">
          <FileText className="h-3 w-3" />
          {t('badges.waitingForTests')}
        </Badge>
      );
    }

    if (application.status === 'testing') {
      const variant = testsCompleted < 3 ? 'default' : testsCompleted < 5 ? 'secondary' : 'default';
      const colorClass = testsCompleted < 3 ? 'bg-blue-600' : testsCompleted < 5 ? 'bg-purple-600' : 'bg-orange-600 animate-pulse';
      
      badges.push(
        <Badge key="progress" variant={variant} className={cn('gap-1', colorClass)}>
          <FileText className="h-3 w-3" />
          {testsCompleted}/6 {t('tests:tests')}
        </Badge>
      );
    }

    // 2. All tests completed (for evaluated)
    if (application.status === 'evaluated') {
      if (testsCompleted === 6) {
        badges.push(
          <Badge key="completed" variant="default" className="gap-1 bg-emerald-600">
            <CheckCircle className="h-3 w-3" />
            6/6 {t('tests:tests')}
          </Badge>
        );
      } else {
        badges.push(
          <Badge key="incomplete" variant="destructive" className="gap-1 animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            {testsCompleted}/6 {t('tests:tests')}
          </Badge>
        );
      }
    }

    // 3. Interview recommendation (for interview status AFTER completion)
    if (application.status === 'interview' && application.interview_recommendation) {
      const configs = {
        hire_strongly: { 
          label: t('badges.hireStrongly'), 
          className: 'bg-gradient-to-r from-emerald-600 to-teal-600 animate-pulse shadow-lg shadow-emerald-500/30',
          icon: Trophy
        },
        hire: { 
          label: t('badges.hire'), 
          className: 'bg-blue-600',
          icon: CheckCircle
        },
        consider: { 
          label: t('badges.consider'), 
          className: 'bg-amber-600',
          icon: Users
        },
        reject: {
          label: t('badges.reject'),
          className: 'bg-red-600',
          icon: X
        }
      };

      const config = configs[application.interview_recommendation as keyof typeof configs];
      if (config) {
        const Icon = config.icon;
        badges.push(
          <Badge key="recommendation" className={cn('gap-1', config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      }
    }

    // 4. Interview planned (for interview BEFORE completion)
    if (application.status === 'interview' && !application.interview_recommendation && application.latest_interview_id) {
      badges.push(
        <Badge key="interview-planned" variant="default" className="gap-1 bg-indigo-600">
          <Calendar className="h-3 w-3" />
          {t('badges.interviewPlanned')}
        </Badge>
      );
    }

    // 5. Ready for offer
    if (application.status === 'offer') {
      badges.push(
        <Badge key="offer" variant="default" className="gap-1 bg-emerald-600">
          <Sparkles className="h-3 w-3" />
          {t('badges.readyForOffer')}
        </Badge>
      );
    }

    // 6. Hired
    if (application.status === 'hired') {
      badges.push(
        <Badge key="hired" variant="default" className="gap-1 bg-gradient-to-r from-emerald-700 to-teal-700">
          <Trophy className="h-3 w-3" />
          {t('badges.hired')}
        </Badge>
      );
    }

    // 7. Rejected
    if (application.status === 'rejected') {
      badges.push(
        <Badge key="rejected" variant="destructive" className="gap-1">
          <X className="h-3 w-3" />
          {t('badges.rejected')}
        </Badge>
      );
    }

    return badges;
  };

  // Context actions based on status
  const renderContextActions = () => {
    const actions = [];

    // EVALUATED: Interview invitation only
    if (application.status === 'evaluated') {
      const isComplete = testsCompleted === 6;
      actions.push(
        <div key="interview-action" className="flex items-center gap-2 w-full">
          <Button
            variant={isComplete ? "default" : "secondary"}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => isComplete && onInviteToInterview?.(application.id)}
            disabled={!isComplete}
            title={!isComplete ? t('tests:testsRequired') : undefined}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">{t('actions.inviteToInterview')}</span>
          </Button>
          <HelpCircle 
            topicId="interview_plan" 
            className="shrink-0" 
            iconClassName="h-4 w-4"
          />
        </div>
      );
      
      if (!isComplete) {
        actions.push(
          <p key="warning-text" className="text-[10px] text-destructive text-center italic">
            {t('tests:allTestsRequired')}
          </p>
        );
      }
    }

    // INTERVIEW: Conduct or View
    if (application.status === 'interview') {
      if (!application.interview_recommendation && application.latest_interview_id) {
        // Interview not completed yet
        actions.push(
          <div key="conduct-action" className="flex items-center gap-2 w-full">
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => application.latest_interview_id && onOpenInterview?.(application.latest_interview_id)}
            >
              <PlayCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('actions.conductInterview')}</span>
            </Button>
            <HelpCircle 
              topicId="interview_plan" 
              className="shrink-0" 
              iconClassName="h-4 w-4"
            />
          </div>
        );
      } else if (application.interview_recommendation && (application.interview_recommendation === 'hire_strongly' || application.interview_recommendation === 'hire')) {
        // Interview completed with positive recommendation - move to offer
        actions.push(
          <Button
            key="offer"
            variant="default"
            size="sm"
            className={cn(
              "w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg",
              application.interview_recommendation === 'hire_strongly' && "animate-pulse shadow-emerald-500/50"
            )}
            onClick={() => onMoveToOffer?.(application.id)}
          >
            <Sparkles className="h-4 w-4" />
            {t('actions.moveToOffer')}
          </Button>
        );
      } else if (application.interview_recommendation === 'consider') {
        // Interview completed but needs discussion
        actions.push(
          <div key="consider-hint" className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <Users className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t('actions.considerHint')}</span>
            </p>
          </div>
        );
        
        // Allow moving to offer but less prominently
        actions.push(
          <Button
            key="offer-consider"
            variant="outline"
            size="sm"
            className="w-full gap-2 border-emerald-600/50 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            onClick={() => onMoveToOffer?.(application.id)}
          >
            <Sparkles className="h-4 w-4" />
            {t('actions.moveToOffer')}
          </Button>
        );
      }

      // View protocol (if interview exists)
      if (application.latest_interview_id) {
        actions.push(
          <div key="protocol-action" className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => application.latest_interview_id && onOpenInterview?.(application.latest_interview_id)}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('actions.viewProtocol')}</span>
            </Button>
          </div>
        );
      }
    }

    // OFFER: Chat + Accept/Decline
    if (application.status === 'offer') {
      // Primary: Open chat to discuss offer
      actions.push(
        <Button
          key="chat"
          variant="default"
          size="sm"
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 shadow-md"
          onClick={handleDiscussOffer}
        >
          <MessageSquare className="h-4 w-4" />
          {t('actions.discussOffer')}
        </Button>
      );
      
      // Secondary actions
      actions.push(
        <Button
          key="accepted"
          variant="outline"
          size="sm"
          className="w-full gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          onClick={() => onStatusChange?.('hire', application.id)}
        >
          <Trophy className="h-4 w-4" />
          {t('actions.acceptedOffer')}
        </Button>
      );

      actions.push(
        <Button
          key="declined"
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => onStatusChange?.('rejected', application.id)}
        >
          <X className="h-4 w-4" />
          {t('actions.declinedOffer')}
        </Button>
      );
    }

    return actions;
  };

  const handleDiscussOffer = async () => {
    // Сначала убеждаемся, что чат существует
    try {
      // Пытаемся получить hr_specialist_id текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: hrProfile } = await supabase
        .from('hr_specialists')
        .select('id, organization_id')
        .eq('user_id', user.id)
        .single();

      if (!hrProfile) throw new Error('HR profile not found');

      // Проверяем наличие чата
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('hr_specialist_id', hrProfile.id)
        .eq('candidate_id', application.candidate.id)
        .maybeSingle();

      if (!existingRoom) {
        // Создаем чат, если его нет
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            hr_specialist_id: hrProfile.id,
            candidate_id: application.candidate.id,
            organization_id: hrProfile.organization_id
          })
          .select('id')
          .single();

        if (createError) throw createError;
        if (newRoom) {
          navigate(`/hr/chat?candidateId=${application.candidate.id}`);
        }
      } else {
        navigate(`/hr/chat?candidateId=${application.candidate.id}`);
      }
    } catch (error) {
      console.error('Error ensuring chat room:', error);
      toast.error(t('common:error'), {
        description: t('ai-analysis:errors.chatCreationFailed')
      });
    }
  };

  const contextActions = renderContextActions();
  const dynamicBadges = renderDynamicBadges();

  return (
    <Card
      className="relative overflow-hidden bg-card/40 hover:bg-card/60 backdrop-blur-md transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-primary/5 border border-border/50 rounded-[1.5rem]"
    >
      <CardContent className="p-4 space-y-4">
        {/* Header: Avatar, Name, Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 border-2 border-background shadow-md transition-transform group-hover:scale-110 duration-300">
              <AvatarImage src={avatarUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20 text-primary text-xs font-black">
                {getInitials(application.candidate.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold truncate leading-none mb-1.5 group-hover:text-primary transition-colors">
                {application.candidate.full_name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {categoryName || t('common:notSpecified')}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('common:actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Ручное перемещение только для rejected и hired */}
              {(application.status === 'rejected' || application.status === 'hired') && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange?.('move_request', application.id)}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {t('funnel:move')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {application.status !== 'rejected' && application.status !== 'hired' && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange?.('rejected', application.id)} className="text-destructive focus:text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    {t('badges.reject')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => navigate(`/hr/candidate/${application.candidate.id}`)}>
                <User className="mr-2 h-4 w-4" />
                {t('funnel:profile')}
              </DropdownMenuItem>
              {application.status !== 'rejected' && (
                <DropdownMenuItem onClick={handleDiscussOffer}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('funnel:chat')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dynamic Badges */}
        {dynamicBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dynamicBadges}
          </div>
        )}

        {/* Progress Bar for Testing */}
        {application.status === 'testing' && (
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              <span>{t('progress.testsProgress')}</span>
              <span className="text-primary">{testsCompleted}/6</span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${(testsCompleted / 6) * 100}%` }}
              />
            </div>
            {testsCompleted === 5 && (
              <p className="text-[10px] text-amber-500 font-bold animate-pulse text-center">
                {t('progress.almostDone')}
              </p>
            )}
          </div>
        )}

        {/* Context Actions */}
        {contextActions.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border/20">
            {contextActions}
          </div>
        )}

        {/* Footer: Date & Standard Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/20">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
            {format(new Date(application.created_at), 'dd MMM yyyy')}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => navigate(`/hr/candidate/${application.candidate.id}`)}
              title={t('funnel:profile')}
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {application.status !== 'rejected' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-muted"
                onClick={handleDiscussOffer}
                title={t('funnel:chat')}
              >
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
