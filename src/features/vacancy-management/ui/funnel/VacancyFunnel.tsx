import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { KanbanColumn } from './KanbanColumn.tsx';
import { AddCandidateDialog } from './AddCandidateDialog';
import { GenerateDocumentDialog } from '@/features/ai-analysis/ui/GenerateDocumentDialog';
import { GenerateStructuredInterviewDialog } from '@/features/ai-analysis/ui/GenerateStructuredInterviewDialog';
import { CompareCandidatesDialog } from '@/features/ai-analysis/ui/CompareCandidatesDialog';
import { ComparisonResultView } from '@/features/ai-analysis/ui/ComparisonResultView';
import { ComparisonHistory } from '@/features/ai-analysis/ui/ComparisonHistory';
import { useGenerateInterviewPlan } from '@/features/structured-interview/api/generateInterviewPlan';
import { useGetComparisonById } from '@/features/ai-analysis/api/getComparisons';
import { InterviewWorkspace } from '@/features/structured-interview/ui/InterviewWorkspace';
import { useGetInterviewSession } from '@/features/structured-interview/api/getInterviewSessions';
import { useGetApplicationsByVacancy } from '@/features/vacancy-management/api/getApplicationsByVacancy';
import { useOrganization } from '@/shared/hooks/useOrganization';
import { useHrProfile } from '@/shared/hooks/useHrProfile';
import { AIGenerationModal } from '@/shared/ui/AIGenerationModal';
import type { DocumentType } from '@/features/ai-analysis/api/generateDocument';
import type { SmartApplication } from '@/shared/types/extended';

interface DialogState {
  isOpen: boolean;
  application: SmartApplication | null;
  documentType: DocumentType;
  additionalInfo: string;
}

interface ConfirmationDialogState {
  type: 'reject' | 'offer_simple' | null;
  application: SmartApplication | null;
  newStatus: string;
}

interface VacancyFunnelProps {
  vacancyId: string;
}

export const VacancyFunnel = ({ vacancyId }: VacancyFunnelProps) => {
  const { t, i18n } = useTranslation(['funnel', 'common', 'ai-analysis']);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: organization } = useOrganization();
  const { data: hrProfile } = useHrProfile();
  
  const [activeTab, setActiveTab] = useState('invited');
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    application: null,
    documentType: 'interview_invitation',
    additionalInfo: '',
  });
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({
    type: null,
    application: null,
    newStatus: '',
  });
  const [moveDialog, setMoveDialog] = useState<{ isOpen: boolean; applicationId: string | null }>({
    isOpen: false,
    applicationId: null,
  });

  // AI Generation states
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [viewingInterviewId, setViewingInterviewId] = useState<string | null>(null);
  
  const [interviewDialogState, setInterviewDialogState] = useState<{
    isOpen: boolean;
    applicationId: string | null;
  }>({ isOpen: false, applicationId: null });
  
  // Comparison states
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
  const [viewingComparisonId, setViewingComparisonId] = useState<string | null>(null);
  const [showComparisonHistory, setShowComparisonHistory] = useState(false);

  // Fetch data using new API
  const { data: applications, isLoading } = useGetApplicationsByVacancy(vacancyId);
  const { data: viewingComparison } = useGetComparisonById(viewingComparisonId);
  
  // Fetch vacancy details
  const { data: vacancy } = useQuery({
    queryKey: ['vacancy', vacancyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('vacancies')
        .select('id, title, funnel_counts')
        .eq('id', vacancyId)
        .single();
      return data;
    },
  });

  // AI Mutations
  const generateInterviewMutation = useGenerateInterviewPlan();

  // Group applications by status
  const groupedByStatus = useMemo(() => {
    const groups: Record<string, SmartApplication[]> = {
      invited: [],
      testing: [],
      evaluated: [],
      interview: [],
      offer: [],
      hired: [],
      rejected: [],
    };

    applications?.forEach(app => {
      if (app.status && groups[app.status]) {
        groups[app.status].push(app);
      }
    });

    return groups;
  }, [applications]);
  
  // Calculate candidates available for comparison (all with 6/6 tests from any column)
  const candidatesAvailableForComparison = useMemo(() => {
    return applications?.filter(app => app.candidate.tests_completed === 6) || [];
  }, [applications]);
  
  const compareAvailableCount = candidatesAvailableForComparison.length;

  const statuses = [
    { id: 'invited', label: t('status.invited') },
    { id: 'testing', label: t('status.testing') },
    { id: 'evaluated', label: t('status.evaluated') },
    { id: 'interview', label: t('status.interview') },
    { id: 'offer', label: t('status.offer') },
    { id: 'hired', label: t('status.hired') },
    { id: 'rejected', label: t('status.rejected') },
  ];

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      applicationId,
      newStatus,
    }: {
      applicationId: string;
      newStatus: string;
    }) => {
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', vacancyId] });
      queryClient.invalidateQueries({ queryKey: ['vacancy', vacancyId] });
    },
  });

  // Handler for status changes and actions
  const handleStatusChange = (action: string, applicationId?: string) => {
    if (!applicationId) return;
    
    const application = applications?.find(app => app.id === applicationId);
    if (!application) return;

    // Handle special actions
    if (action === 'move_request') {
      setMoveDialog({ isOpen: true, applicationId });
      return;
    }

    // Handle status changes
    if (action === 'rejected') {
      setConfirmationDialog({ type: 'reject', application, newStatus: 'rejected' });
    } else if (action === 'hire') {
      updateStatusMutation.mutate({ applicationId, newStatus: 'hired' });
      toast.success(t('statusUpdated'), {
        description: `${application.candidate.full_name} ${t('badges.hired')}`,
        icon: '🎉',
      });
    } else {
      updateStatusMutation.mutate({ applicationId, newStatus: action });
      toast.success(t('statusUpdated'));
    }
  };

  const handleMoveToStatus = (applicationId: string, newStatus: string) => {
    const application = applications?.find(app => app.id === applicationId);
    if (!application || application.status === newStatus) return;

    // Закрываем диалог выбора статуса
    setMoveDialog({ isOpen: false, applicationId: null });

    // Блокируем невозможные переходы
    const impossibleTransitions = [
      ['rejected', 'hired'],
      ['hired', 'testing'],
      ['hired', 'invited'],
      ['rejected', 'offer'],
    ];

    const isImpossible = impossibleTransitions.some(
      ([from, to]) => application.status === from && newStatus === to
    );

    if (isImpossible) {
      toast.error(t('impossibleTransition'), {
        description: t('impossibleTransitionDesc'),
      });
      return;
    }

    // Маршрутизация на правильные диалоги
    if (newStatus === 'rejected') {
      setConfirmationDialog({ type: 'reject', application, newStatus });
    } else if (newStatus === 'offer') {
      // Валидация для перехода в offer
      if (!application.interview_recommendation) {
        toast.warning(t('offerRequiresInterview'));
        return;
      }
      
      if (application.interview_recommendation === 'reject') {
        toast.error(t('offerCannotMoveRejected'));
        return;
      }
      
      if (application.interview_recommendation === 'consider') {
        toast.info(t('offerConsiderReminder'), {
          description: t('offerConsiderReminderDesc'),
          duration: 6000,
        });
      }
      
      setConfirmationDialog({ type: 'offer_simple', application, newStatus });
    } else {
      // Все остальные - мгновенно
      updateStatusMutation.mutate({ applicationId, newStatus });
      toast.success(t('statusUpdated'));
    }
  };
  const handleInviteToInterview = (applicationId: string) => {
    setInterviewDialogState({ isOpen: true, applicationId });
  };
  
  // Confirmed generation after dialog
  const handleConfirmedInterviewGeneration = async () => {
    const { applicationId } = interviewDialogState;
    const application = applications?.find(app => app.id === applicationId);
    if (!application || !organization || !hrProfile || !applicationId) return;

    setInterviewDialogState({ isOpen: false, applicationId: null });
    setIsGeneratingInterview(true);

    try {
      const result = await generateInterviewMutation.mutateAsync({
        candidate_id: application.candidate.id,
        vacancy_id: vacancyId,
        organization_id: organization.id,
        hr_specialist_id: hrProfile.id,
        language: i18n.language as 'ru' | 'en' | 'kk',
        additional_info: '',
      });

      // Auto-transition to interview status
      await supabase
        .from('applications')
        .update({
          status: 'interview',
          latest_interview_id: result.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      // Log timeline event
      await supabase
        .from('application_timeline')
        .insert({
          application_id: applicationId,
          event_type: 'interview_planned',
          triggered_by: 'hr',
          hr_specialist_id: hrProfile.id,
          details: { session_id: result.id }
        });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['applications', vacancyId] });
      queryClient.invalidateQueries({ queryKey: ['vacancy', vacancyId] });

      toast.success(t('Interview plan created'), {
        description: t('Candidate moved to Interview'),
        action: {
          label: t('common:view'),
          onClick: () => setViewingInterviewId(result.id)
        }
      });
    } catch (error: unknown) {
      console.error('Error generating interview:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('all 6 tests')) {
        toast.error(t('tests:testsRequired'), {
          description: t('tests:completeAllTestsDesc')
        });
      } else {
        toast.error(t('ai-analysis:errors.interviewGenerationFailed'), {
          description: errorMessage
        });
      }
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const handleMoveToOffer = (applicationId: string) => {
    const application = applications?.find(app => app.id === applicationId);
    if (!application) return;

    setConfirmationDialog({
      type: 'offer_simple',
      application,
      newStatus: 'offer'
    });
  };

  const handleOpenInterview = (sessionId: string) => {
    setViewingInterviewId(sessionId);
  };
  
  // Comparison handlers
  const handleCompare = () => {
    setIsCompareDialogOpen(true);
  };
  
  const handleViewComparisonHistory = () => {
    setShowComparisonHistory(true);
  };

  const handleConfirmationAction = async (generateDocument: boolean) => {
    const { application, newStatus, type } = confirmationDialog;
    if (!application) return;

    // Для offer_simple - просто обновляем статус
    if (type === 'offer_simple') {
      await updateStatusMutation.mutateAsync({ applicationId: application.id, newStatus });
      setConfirmationDialog({ type: null, application: null, newStatus: '' });
      toast.success(t('statusUpdated'), {
        description: t('offerStatusUpdated'),
        action: {
          label: t('common:chat'),
          onClick: () => navigate(`/hr/chat?candidateId=${application.candidate.id}`)
        }
      });
      return;
    }

    await updateStatusMutation.mutateAsync({ applicationId: application.id, newStatus });
    setConfirmationDialog({ type: null, application: null, newStatus: '' });

    if (generateDocument) {
      let documentType: DocumentType = 'interview_invitation';
      if (type === 'reject') documentType = 'rejection_letter';

      setDialogState({
        isOpen: true,
        application,
        documentType,
        additionalInfo: '',
      });
    } else {
      toast.success(t('statusUpdated'));
    }
  };

  if (isLoading) {
    return <FunnelSkeleton />;
  }

  return (
    <>
      <div className="h-full flex flex-col bg-background md:bg-muted/5">
        {/* Compact Header */}
        <div className="border-b bg-background z-10 px-4 py-3 flex items-center justify-between gap-4 sticky top-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 -ml-1"
              onClick={() => navigate('/hr/dashboard?tab=vacancies')}
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="min-w-0 flex flex-col">
              <h1 className="text-lg font-semibold truncate leading-tight">{vacancy?.title}</h1>
              <p className="text-xs text-muted-foreground truncate">
                {applications?.length || 0} {t('funnel:candidates')}
              </p>
            </div>
          </div>
          
          <Button size="sm" onClick={() => setIsAddCandidateOpen(true)} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('addCandidate')}</span>
          </Button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {/* Desktop View */}
          <div className="hidden md:flex h-full overflow-x-auto px-6 py-6 gap-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {statuses.map(status => (
              <KanbanColumn
                key={status.id}
                id={status.id}
                title={status.label}
                count={groupedByStatus[status.id]?.length || 0}
                applications={groupedByStatus[status.id] || []}
                onStatusChange={handleStatusChange}
                onInviteToInterview={handleInviteToInterview}
                onMoveToOffer={handleMoveToOffer}
                onOpenInterview={handleOpenInterview}
                onCompare={handleCompare}
                onViewComparisonHistory={handleViewComparisonHistory}
                compareAvailableCount={compareAvailableCount}
              />
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden h-full flex flex-col">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-4 py-2 border-b bg-background/50 backdrop-blur-sm">
                <TabsList className="w-full overflow-x-auto justify-start bg-transparent p-0 h-auto gap-2 no-scrollbar">
                  {statuses.map(status => (
                    <TabsTrigger 
                      key={status.id} 
                      value={status.id} 
                      className="flex-shrink-0 rounded-full border bg-background px-3 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm"
                    >
                      {status.label}
                      <span className="ml-2 text-xs opacity-70 bg-black/10 dark:bg-white/20 px-1.5 py-0.5 rounded-full">
                        {groupedByStatus[status.id]?.length || 0}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {statuses.map(status => (
               <TabsContent key={status.id} value={status.id} className="flex-1 mt-0 overflow-y-auto px-4 py-4">
                 <KanbanColumn
                   id={status.id}
                   title={status.label}
                   count={groupedByStatus[status.id]?.length || 0}
                   applications={groupedByStatus[status.id] || []}
                   onStatusChange={handleStatusChange}
                   onInviteToInterview={handleInviteToInterview}
                   onMoveToOffer={handleMoveToOffer}
                   onOpenInterview={handleOpenInterview}
                   onCompare={handleCompare}
                   onViewComparisonHistory={handleViewComparisonHistory}
                   compareAvailableCount={compareAvailableCount}
                 />
               </TabsContent>
             ))}
            </Tabs>
          </div>
        </div>
      </div>

      {dialogState.isOpen && dialogState.application && (
        <GenerateDocumentDialog
          isOpen={dialogState.isOpen}
          onOpenChange={(isOpen) => setDialogState({ ...dialogState, isOpen })}
          candidateId={dialogState.application.candidate.id}
          vacancyId={dialogState.application.vacancy_id}
        />
      )}
      <AddCandidateDialog
        isOpen={isAddCandidateOpen}
        onOpenChange={setIsAddCandidateOpen}
        vacancyId={vacancyId}
      />
      
      <AlertDialog open={!!confirmationDialog.type} onOpenChange={(open) => !open && setConfirmationDialog({ type: null, application: null, newStatus: '' })}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationDialog.type === 'reject' && t('rejectCandidate')}
              {confirmationDialog.type === 'offer_simple' && t('moveToOffer')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.type === 'reject' && t('rejectDescription', { name: confirmationDialog.application?.candidate.full_name })}
              {confirmationDialog.type === 'offer_simple' && t('offerSimpleDescription', { name: confirmationDialog.application?.candidate.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <Alert>
              {confirmationDialog.type === 'reject' && <Info className="h-4 w-4" />}
              {confirmationDialog.type === 'offer_simple' && <Sparkles className="h-4 w-4" />}
              <AlertTitle>
                {confirmationDialog.type === 'reject' && t('rejectInfo')}
                {confirmationDialog.type === 'offer_simple' && t('offerSimpleInfo')}
              </AlertTitle>
              <AlertDescription>
                {confirmationDialog.type === 'reject' && t('rejectInfoDescription')}
                {confirmationDialog.type === 'offer_simple' && t('offerSimpleInfoDescription')}
              </AlertDescription>
            </Alert>
          </div>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setConfirmationDialog({ type: null, application: null, newStatus: '' })}>
              {t('common:cancel')}
            </AlertDialogCancel>
            {confirmationDialog.type === 'offer_simple' ? (
              <AlertDialogAction onClick={() => handleConfirmationAction(false)}>
                {t('offerSimpleConfirm')}
              </AlertDialogAction>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleConfirmationAction(false)}
                  className="w-full sm:w-auto"
                >
                  {t('rejectWithoutLetter')}
                </Button>
                <AlertDialogAction onClick={() => handleConfirmationAction(true)} className="w-full sm:w-auto">
                  {t('rejectAndSendLetter')}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={moveDialog.isOpen} onOpenChange={(isOpen) => setMoveDialog({ isOpen, applicationId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('funnel:moveCandidate')}</AlertDialogTitle>
            <AlertDialogDescription>
              {applications?.find(a => a.id === moveDialog.applicationId)?.status === 'rejected'
                ? t('funnel:moveBackDescription')
                : t('funnel:reopenHiredDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {/* Только разумные переходы для rejected/hired */}
            {(() => {
              const app = applications?.find(a => a.id === moveDialog.applicationId);
              if (!app) return null;
              
              let availableStatuses: Array<{ id: string; label: string }> = [];
              if (app.status === 'rejected') {
                // Можем вернуть в interview или evaluated для переоценки
                availableStatuses = [
                  statuses.find(s => s.id === 'interview'),
                  statuses.find(s => s.id === 'evaluated')
                ].filter((s): s is { id: string; label: string } => s !== undefined);
              } else if (app.status === 'hired') {
                // Редкий случай: возврат нанятого кандидата
                availableStatuses = [
                  statuses.find(s => s.id === 'interview')
                ].filter((s): s is { id: string; label: string } => s !== undefined);
              }
              
              return availableStatuses.map((status) => (
                <Button
                  key={status.id}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => moveDialog.applicationId && handleMoveToStatus(moveDialog.applicationId, status.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{status.label}</span>
                  </div>
                </Button>
              ));
            })()}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Generation Modals */}
      <AIGenerationModal
        isOpen={isGeneratingInterview}
        onOpenChange={() => {}}
        isPending={isGeneratingInterview}
        title={t('ai-analysis:generateInterview.title')}
        description={t('ai-analysis:generateInterview.description')}
        simulationMode="slow"
      />

      {/* Interview Workspace Overlay */}
      {viewingInterviewId && (
        <Dialog open={!!viewingInterviewId} onOpenChange={() => setViewingInterviewId(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('ai-analysis:generateInterview.title')}</DialogTitle>
              <DialogDescription>
                {t('ai-analysis:generateInterview.description')}
              </DialogDescription>
            </DialogHeader>
            <InterviewWorkspaceWrapper
              sessionId={viewingInterviewId}
              onClose={() => setViewingInterviewId(null)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Controlled Dialogs for AI Generation */}
      {interviewDialogState.applicationId && applications?.find(a => a.id === interviewDialogState.applicationId) && (
        <GenerateStructuredInterviewDialog
          isOpen={interviewDialogState.isOpen}
          onOpenChange={(open) => setInterviewDialogState(prev => ({ ...prev, isOpen: open }))}
          candidateId={applications.find(a => a.id === interviewDialogState.applicationId)!.candidate.id}
          vacancyId={vacancyId}
          disabled={false}
          onSuccess={handleConfirmedInterviewGeneration}
        />
      )}
      
      {/* Comparison Dialog and Overlay */}
      <CompareCandidatesDialog
        isOpen={isCompareDialogOpen}
        onOpenChange={setIsCompareDialogOpen}
        vacancyId={vacancyId}
        candidates={candidatesAvailableForComparison.map(app => ({
          id: app.candidate.id,
          full_name: app.candidate.full_name || 'Unknown',
          tests_completed: app.candidate.tests_completed || 0
        }))}
        onComparisonCreated={(comparisonId) => {
          queryClient.invalidateQueries({ queryKey: ['comparisons', vacancyId] });
          setViewingComparisonId(comparisonId);
        }}
      />
      
      {viewingComparisonId && viewingComparison && (
        <Dialog open={!!viewingComparisonId} onOpenChange={() => setViewingComparisonId(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('ai-analysis:compareCandidates.title')}</DialogTitle>
              <DialogDescription>
                {t('ai-analysis:compareCandidates.description')}
              </DialogDescription>
            </DialogHeader>
            <ComparisonResultView
              data={viewingComparison.ranking}
              candidateNames={applications?.reduce((acc, app) => {
                acc[app.candidate.id] = app.candidate.full_name || 'Unknown';
                return acc;
              }, {} as Record<string, string>) || {}}
              onBack={() => setViewingComparisonId(null)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Comparison History Overlay */}
      {showComparisonHistory && (
        <Dialog open={showComparisonHistory} onOpenChange={setShowComparisonHistory}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('funnel:compareHistoryTitle')}</DialogTitle>
              <DialogDescription>
                {t('funnel:compareHistoryDescription')}
              </DialogDescription>
            </DialogHeader>
            <ComparisonHistory
              vacancyId={vacancyId}
              onViewComparison={(id) => {
                setShowComparisonHistory(false);
                setViewingComparisonId(id);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Wrapper component for overlay view
const InterviewWorkspaceWrapper = ({ sessionId, onClose }: { sessionId: string; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { data: session, isLoading } = useGetInterviewSession(sessionId);

  const handleBack = () => {
    queryClient.invalidateQueries({ queryKey: ['applications', session?.vacancy_id] });
    queryClient.invalidateQueries({ queryKey: ['interview-sessions'] });
    onClose();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!session) {
    return <div className="text-center p-8 text-muted-foreground">Interview not found</div>;
  }

  return <InterviewWorkspace session={session} onBack={handleBack} isInDialog={true} />;
};

const FunnelSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="h-9 w-20 bg-muted rounded-md" />
          <div>
            <div className="h-8 w-64 bg-muted rounded-md" />
            <div className="h-4 w-32 bg-muted rounded-md mt-2" />
          </div>
        </div>
        <div className="h-9 w-32 bg-muted rounded-md" />
      </div>
    </div>
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
      <div className="inline-flex gap-4 min-h-full">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col w-80 flex-shrink-0 bg-muted/30 rounded-lg">
            <div className="p-3 border-b bg-background rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-muted rounded-md" />
                <div className="h-6 w-8 bg-muted rounded-full" />
              </div>
            </div>
            <div className="p-2 space-y-2">
              <div className="h-24 bg-muted rounded-md" />
              <div className="h-24 bg-muted rounded-md" />
              <div className="h-24 bg-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
