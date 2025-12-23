import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetCandidateById } from '@/features/candidate-management/api/getCandidateById'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, MessageCircle, Loader2, FileText, MessageSquare, User } from 'lucide-react'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useGetGeneratedDocumentsByCandidate } from '@/features/ai-analysis/api/getGeneratedDocuments'
import { DocumentHistory } from '@/features/ai-analysis/ui/DocumentHistory'
import { DocumentView } from '@/features/ai-analysis/ui/DocumentView'
import { getChatRoomByParticipants } from '@/features/chat/api'
import { checkCandidateRelation } from '@/features/candidate-management/api/checkCandidateRelation'
import { supabase } from '@/shared/lib/supabase'
import { InterviewWorkspace, InterviewHistory } from '@/features/structured-interview/ui'
import { useGetInterviewSessions } from '@/features/structured-interview/api'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['candidates', 'common', 'ai-analysis'])
  const { data: organization } = useOrganization()
  const { data: hrProfile } = useHrProfile()
  const queryClient = useQueryClient()

  const {
    data: candidate,
    isLoading: isLoadingCandidate,
  } = useGetCandidateById(id!)

  const {
    data: documents = [],
    isLoading: isLoadingDocuments,
  } = useGetGeneratedDocumentsByCandidate(id!, organization?.id)

  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null)
  const viewingDocument = documents.find(d => d.id === viewingDocumentId) || null
  
  const {
    data: interviewSessions = [],
    isLoading: isLoadingInterviews,
  } = useGetInterviewSessions(id!)
  
  const [viewingInterviewId, setViewingInterviewId] = useState<string | null>(null)
  const viewingInterview = interviewSessions.find(s => s.id === viewingInterviewId) || null
  
  const [isCheckingChat, setIsCheckingChat] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const { data: isRelated, isLoading: isCheckingRelation } = useQuery({
    queryKey: ['candidate-relation', id, organization?.id],
    queryFn: async () => {
      if (!id || !organization?.id) return false;
      return checkCandidateRelation(id, organization.id);
    },
    enabled: !!id && !!organization?.id,
  })

  const handleShareDocument = async () => {
    if (!viewingDocument?.id || isSharing) return
    
    setIsSharing(true)
    
    try {
      const publicUrl = `${window.location.origin}/public/document/${viewingDocument.id}`
      
      if (viewingDocument.is_public) {
        await navigator.clipboard.writeText(publicUrl)
        toast.success(t('ai-analysis:documents.linkCopied', 'Ссылка скопирована'))
      } else {
        await supabase
          .from('generated_documents')
          .update({ is_public: true })
          .eq('id', viewingDocument.id)
        
        await navigator.clipboard.writeText(publicUrl)
        queryClient.invalidateQueries({ queryKey: ['documents', id, organization?.id] })
        toast.success(t('ai-analysis:documents.linkCopied', 'Ссылка скопирована'))
      }
    } catch (error) {
      console.error('Failed to share document', error)
      toast.error(t('common:error'))
    } finally {
      setIsSharing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!hrProfile || !id || !organization) return
    
    setIsCheckingChat(true)
    try {
      const room = await getChatRoomByParticipants(hrProfile.id, id)
      
      if (room) {
        navigate(`/hr/chat?candidateId=${id}`)
        return;
      }

      if (isRelated) {
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            hr_specialist_id: hrProfile.id,
            candidate_id: id,
            organization_id: organization.id
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        
        if (newRoom) {
          navigate(`/hr/chat?candidateId=${id}`);
        }
      } else {
        toast.error(t('profile.chatNotAvailable'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('common:error'))
    } finally {
      setIsCheckingChat(false)
    }
  }

  const isLoading = isLoadingCandidate || isLoadingDocuments || isLoadingInterviews

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-1/4 mt-2" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>{t('common:error')}</AlertTitle>
          <AlertDescription>{t('candidates:profile.notFound')}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get category name from candidate data
  const categoryName = (() => {
    // If we have full category object (from join)
    if (candidate.category && candidate.category.name_ru) {
      // @ts-expect-error: dynamic key access
      return candidate.category[`name_${i18n.language}`] || candidate.category.name_ru;
    }
    
    // Fallback if no category data
    return t('common:notSpecified');
  })();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {viewingInterview ? (
        <InterviewWorkspace
          session={viewingInterview}
          onBack={() => setViewingInterviewId(null)}
        />
      ) : viewingDocument ? (
        <DocumentView
          document={viewingDocument}
          onBack={() => setViewingDocumentId(null)}
          onShare={handleShareDocument}
          isSharing={isSharing}
        />
      ) : (
        <>
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/hr/dashboard?tab=candidates')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{candidate.full_name}</h1>
                <p className="text-muted-foreground mt-1">{categoryName}</p>
              </div>
            </div>
            
            <Button
              variant={isRelated ? "default" : "secondary"}
              onClick={handleSendMessage}
              disabled={isCheckingChat || isCheckingRelation || !isRelated}
              title={!isRelated && !isCheckingRelation ? t('profile.chatNotAvailable') : undefined}
              className="gap-2"
            >
              {isCheckingChat || isCheckingRelation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {t('common:sendMessage')}
            </Button>
          </div>

          {/* Tabs for History */}
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-1 lg:grid-cols-3">
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                {t('profile.tabs.documents')}
              </TabsTrigger>
              <TabsTrigger value="interviews" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('profile.tabs.interviews')}
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-2">
                <User className="h-4 w-4" />
                {t('profile.tabs.info')}
              </TabsTrigger>
            </TabsList>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>{t('profile.documentsCard.title')}</CardTitle>
    </CardHeader>
    <CardContent>
      {documents.length > 0 ? (
        <DocumentHistory
          documents={documents}
          onView={(doc) => setViewingDocumentId(doc.id)}
        />
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">{t('profile.documentsCard.empty.title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('profile.documentsCard.empty.description')}</p>
          <p className="mt-4 text-xs text-muted-foreground">{t('profile.documentsCard.empty.hint')}</p>
        </div>
      )}
              </CardContent>
            </Card>
            </TabsContent>

            {/* Interviews Tab */}
            <TabsContent value="interviews" className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>{t('profile.interviewsCard.title')}</CardTitle>
    </CardHeader>
    <CardContent>
      {interviewSessions.length > 0 ? (
        <InterviewHistory
          candidateId={id!}
          onViewSession={(session) => setViewingInterviewId(session.id)}
        />
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">{t('profile.interviewsCard.empty.title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('profile.interviewsCard.empty.description')}</p>
          <p className="mt-4 text-xs text-muted-foreground">{t('profile.interviewsCard.empty.hint')}</p>
        </div>
      )}
              </CardContent>
            </Card>
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.detailsCard.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('profile.detailsCard.email')}</p>
          <p className="text-sm mt-1">{candidate.email || t('common:notSpecified')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('profile.detailsCard.phone')}</p>
          <p className="text-sm mt-1">{candidate.phone || t('common:notSpecified')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('profile.detailsCard.category')}</p>
          <p className="text-sm mt-1">{categoryName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('profile.detailsCard.testsCompleted')}</p>
          <p className="text-sm mt-1">{candidate.tests_completed || 0}/6</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>{t('profile.backgroundCard.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('profile.detailsCard.experience')}</p>
          <p className="text-sm mt-1 whitespace-pre-wrap">{candidate.experience || t('common:notSpecified')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('profile.detailsCard.education')}</p>
          <p className="text-sm mt-1 whitespace-pre-wrap">{candidate.education || t('common:notSpecified')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('profile.detailsCard.about')}</p>
          <p className="text-sm mt-1 whitespace-pre-wrap">{candidate.about || t('common:notSpecified')}</p>
        </div>
                </CardContent>
              </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
