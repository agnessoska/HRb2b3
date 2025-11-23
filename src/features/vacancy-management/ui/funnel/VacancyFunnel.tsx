import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Info, Sparkles, Calendar } from 'lucide-react';
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
import { KanbanColumn } from './KanbanColumn.tsx';
import { AddCandidateDialog } from './AddCandidateDialog';
import { GenerateDocumentDialog } from '@/features/ai-analysis/ui/GenerateDocumentDialog';
import type { DocumentType } from '@/features/ai-analysis/api/generateDocument';
import type { Application } from '../../types';

interface DialogState {
  isOpen: boolean;
  application: Application | null;
  documentType: DocumentType;
  additionalInfo: string;
}

interface ConfirmationDialogState {
  type: 'reject' | 'offer' | 'interview' | null;
  application: Application | null;
  newStatus: string;
}

interface VacancyFunnelProps {
  vacancyId: string;
}

export const VacancyFunnel = ({ vacancyId }: VacancyFunnelProps) => {
  const { t } = useTranslation(['funnel', 'common']);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  // Fetch candidates in the funnel
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['applications', vacancyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select(
          `
          id,
          status,
          created_at,
          updated_at,
          compatibility_score,
          added_by_hr_id,
          candidate_id,
          organization_id,
          vacancy_id,
          candidate:candidates(
            *,
            category:professional_categories(*)
          )
        `
        )
        .eq('vacancy_id', vacancyId)
        .order('updated_at', { ascending: false });

      return data || [];
    },
  });

  // Group applications by status
  const groupedByStatus = useMemo(() => {
    const groups: Record<string, Application[]> = {
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

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    const application = applications?.find(app => app.id === applicationId);
    if (!application || application.status === newStatus) return;

    if (newStatus === 'rejected') {
      setConfirmationDialog({ type: 'reject', application, newStatus });
    } else if (newStatus === 'offer') {
      setConfirmationDialog({ type: 'offer', application, newStatus });
    } else if (newStatus === 'interview') {
      setConfirmationDialog({ type: 'interview', application, newStatus });
    } else {
      updateStatusMutation.mutate({ applicationId, newStatus });
      toast.success(t('statusUpdated'));
    }
    setMoveDialog({ isOpen: false, applicationId: null });
  };

  const handleConfirmationAction = async (generateDocument: boolean) => {
    const { application, newStatus, type } = confirmationDialog;
    if (!application) return;

    await updateStatusMutation.mutateAsync({ applicationId: application.id, newStatus });
    setConfirmationDialog({ type: null, application: null, newStatus: '' });

    if (generateDocument) {
      let documentType: DocumentType = 'interview_invitation';
      if (type === 'reject') documentType = 'rejection_letter';
      if (type === 'offer') documentType = 'job_offer';

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
                onStatusChange={(appId, req) => {
                  if (req === 'move_request') {
                    setMoveDialog({ isOpen: true, applicationId: appId });
                  }
                }}
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
                    onStatusChange={(appId, req) => {
                      if (req === 'move_request') {
                        setMoveDialog({ isOpen: true, applicationId: appId });
                      }
                    }}
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
          documentType={dialogState.documentType}
          onDocumentTypeChange={(type) => setDialogState({ ...dialogState, documentType: type })}
          additionalInfo={dialogState.additionalInfo}
          onAdditionalInfoChange={(info) => setDialogState({ ...dialogState, additionalInfo: info })}
        />
      )}
      <AddCandidateDialog
        isOpen={isAddCandidateOpen}
        onOpenChange={setIsAddCandidateOpen}
        vacancyId={vacancyId}
      />
      
      <AlertDialog open={!!confirmationDialog.type} onOpenChange={(open) => !open && setConfirmationDialog({ type: null, application: null, newStatus: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationDialog.type === 'reject' && t('rejectCandidate')}
              {confirmationDialog.type === 'offer' && t('sendOffer')}
              {confirmationDialog.type === 'interview' && t('inviteToInterview')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.type === 'reject' && t('rejectDescription', { name: confirmationDialog.application?.candidate.full_name })}
              {confirmationDialog.type === 'offer' && t('offerDescription', { name: confirmationDialog.application?.candidate.full_name })}
              {confirmationDialog.type === 'interview' && t('interviewDescription', { name: confirmationDialog.application?.candidate.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <Alert>
              {confirmationDialog.type === 'reject' && <Info className="h-4 w-4" />}
              {confirmationDialog.type === 'offer' && <Sparkles className="h-4 w-4" />}
              {confirmationDialog.type === 'interview' && <Calendar className="h-4 w-4" />}
              <AlertTitle>
                {confirmationDialog.type === 'reject' && t('rejectInfo')}
                {confirmationDialog.type === 'offer' && t('offerInfo')}
                {confirmationDialog.type === 'interview' && t('interviewInfo')}
              </AlertTitle>
              <AlertDescription>
                {confirmationDialog.type === 'reject' && t('rejectInfoDescription')}
                {confirmationDialog.type === 'offer' && t('offerInfoDescription')}
                {confirmationDialog.type === 'interview' && t('interviewInfoDescription')}
              </AlertDescription>
            </Alert>
          </div>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setConfirmationDialog({ type: null, application: null, newStatus: '' })}>{t('common:cancel')}</AlertDialogCancel>
            <Button variant="outline" onClick={() => handleConfirmationAction(false)}>
              {confirmationDialog.type === 'reject' && t('rejectWithoutLetter')}
              {confirmationDialog.type === 'offer' && t('updateStatusOnly')}
              {confirmationDialog.type === 'interview' && t('updateStatusOnly')}
            </Button>
            <AlertDialogAction onClick={() => handleConfirmationAction(true)}>
              {confirmationDialog.type === 'reject' && t('rejectAndSendLetter')}
              {confirmationDialog.type === 'offer' && t('generateAndSendOffer')}
              {confirmationDialog.type === 'interview' && t('generateInvitation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={moveDialog.isOpen} onOpenChange={(isOpen) => setMoveDialog({ isOpen, applicationId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('funnel:moveCandidate')}</AlertDialogTitle>
            <AlertDialogDescription>{t('funnel:selectStatus')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {statuses.map((status) => (
              <Button
                key={status.id}
                variant="outline"
                className="justify-start h-auto py-3 px-4 text-left"
                onClick={() => moveDialog.applicationId && handleStatusChange(moveDialog.applicationId, status.id)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{status.label}</span>
                </div>
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
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
