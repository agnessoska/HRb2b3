import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
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
import { CandidateCard } from './CandidateCard.tsx';
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
  const [activeId, setActiveId] = useState<string | null>(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as string;
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

  const activeApplication = applications?.find(
    app => app.id === activeId
  );

  if (isLoading) {
    return <FunnelSkeleton />;
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/hr/dashboard?tab=vacancies')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common:back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{vacancy?.title}</h1>
              <p className="text-sm text-muted-foreground">
                {t('recruitmentFunnel')}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsAddCandidateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addCandidate')}
          </Button>
        </div>
      </div>

      {vacancy?.funnel_counts && (
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">{t('total')}:</span>
                <span className="ml-2 font-semibold">
                  {applications?.length || 0}
                </span>
              </div>
              {Object.entries(vacancy.funnel_counts).map(([status, count]) => (
                <div key={status}>
                  <span className="text-muted-foreground">
                    {t(`status.${status}`)}:
                  </span>
                  <span className="ml-2 font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Desktop View */}
          <div className="hidden md:inline-flex gap-4 min-h-full h-full overflow-x-auto pb-4">
            {statuses.map(status => (
              <KanbanColumn
                key={status.id}
                id={status.id}
                title={status.label}
                count={groupedByStatus[status.id]?.length || 0}
                applications={groupedByStatus[status.id] || []}
              />
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden h-full">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="w-full overflow-x-auto justify-start mb-4">
                {statuses.map(status => (
                  <TabsTrigger key={status.id} value={status.id} className="flex-shrink-0">
                    {status.label}
                    <span className="ml-2 text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                      {groupedByStatus[status.id]?.length || 0}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {statuses.map(status => (
                <TabsContent key={status.id} value={status.id} className="flex-1 mt-0 h-full overflow-y-auto">
                  <KanbanColumn
                    id={status.id}
                    title={status.label}
                    count={groupedByStatus[status.id]?.length || 0}
                    applications={groupedByStatus[status.id] || []}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <DragOverlay>
            {activeId && activeApplication ? (
              <div className="rotate-3 opacity-80">
                <CandidateCard application={activeApplication} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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
