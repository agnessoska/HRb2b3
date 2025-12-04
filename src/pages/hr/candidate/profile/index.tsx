import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetCandidateById } from '@/features/candidate-management/api/getCandidateById'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Bot, Download, Share2, FileText, PlusCircle, MessageCircle, Loader2 } from 'lucide-react'
import { GenerateFullAnalysisDialog } from '@/features/ai-analysis/ui/GenerateFullAnalysisDialog'
import { GenerateStructuredInterviewDialog } from '@/features/ai-analysis/ui/GenerateStructuredInterviewDialog'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useGetFullAnalysisByCandidate } from '@/features/ai-analysis/api/getFullAnalysisByCandidate'
import { useGetGeneratedDocumentsByCandidate } from '@/features/ai-analysis/api/getGeneratedDocuments'
import { GenerateDocumentDialog } from '@/features/ai-analysis/ui/GenerateDocumentDialog'
import { getChatRoomByParticipants } from '@/features/chat/api'
import { checkCandidateRelation } from '@/features/candidate-management/api/checkCandidateRelation'
import { supabase } from '@/shared/lib/supabase'
import type { DocumentType } from '@/features/ai-analysis/api/generateDocument'
import { marked } from 'marked'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['candidates', 'common'])
  const { data: organization } = useOrganization()
  const { data: hrProfile } = useHrProfile()

  const {
    data: candidate,
    isLoading: isLoadingCandidate, 
    isError: isErrorCandidate, 
    error: errorCandidate 
  } = useGetCandidateById(id!)

  const { 
    data: analysis, 
    isLoading: isLoadingAnalysis,
    isError: isErrorAnalysis,
    error: errorAnalysis
  } = useGetFullAnalysisByCandidate(id!, organization?.id)

  const {
    data: documents,
    isLoading: isLoadingDocuments,
  } = useGetGeneratedDocumentsByCandidate(id!, organization?.id)

  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false)
  const [documentType, setDocumentType] = useState<DocumentType>('interview_invitation')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [isCheckingChat, setIsCheckingChat] = useState(false)

  const { data: isRelated, isLoading: isCheckingRelation } = useQuery({
    queryKey: ['candidate-relation', id, organization?.id],
    queryFn: async () => {
      if (!id || !organization?.id) return false;
      return checkCandidateRelation(id, organization.id);
    },
    enabled: !!id && !!organization?.id,
  });

  const analysisHtml = useMemo(() => {
    if (analysis?.content_markdown) {
      return marked.parse(analysis.content_markdown)
    }
    return ''
  }, [analysis])

  const handleSendMessage = async () => {
    if (!hrProfile || !id || !organization) return
    
    setIsCheckingChat(true)
    try {
      // 1. Try to find existing room
      const room = await getChatRoomByParticipants(hrProfile.id, id)
      
      if (room) {
        navigate(`/hr/chat?candidateId=${id}`)
        return;
      }

      // 2. If room doesn't exist but candidate is ours -> create room
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

  const isLoading = isLoadingCandidate || (organization && (isLoadingAnalysis || isLoadingDocuments))

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

  if (isErrorCandidate || isErrorAnalysis) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>{t('common:error')}</AlertTitle>
          <AlertDescription>{errorCandidate?.message || errorAnalysis?.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{candidate?.full_name}</h1>
        <p className="mt-2 text-muted-foreground">{t('profile.title')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('profile.aiAnalysisCard.title')}</CardTitle>
              {analysis && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    {t('common:share')}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {t('common:downloadPdf')}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div 
                  className="prose dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: analysisHtml as string }} 
                />
              ) : (
                <div className="text-center py-12">
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">{t('profile.aiAnalysisCard.empty.title')}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t('profile.aiAnalysisCard.empty.description')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.documentsCard.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('common:createdAt')} {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">{t('common:view')}</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('profile.documentsCard.empty')}</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.actionsCard.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full gap-2"
                variant={isRelated ? "default" : "secondary"}
                onClick={handleSendMessage}
                disabled={isCheckingChat || isCheckingRelation || !isRelated}
                title={!isRelated && !isCheckingRelation ? t('profile.chatNotAvailable') : undefined}
              >
                {isCheckingChat || isCheckingRelation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {t('common:sendMessage')}
              </Button>
              
              <div className="pt-2">
                <GenerateFullAnalysisDialog
                  candidateId={id!}
                  testsCompleted={candidate?.tests_completed || 0}
                />
              </div>
              
              {(candidate?.tests_completed || 0) < 6 && (
                <p className="text-xs text-muted-foreground pt-1">
                  {t('profile.actionsCard.analysisDisabledTooltip')}
                </p>
              )}
              <Button className="w-full gap-2" onClick={() => setIsDocumentDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                {t('profile.actionsCard.generateDocument')}
              </Button>
              <GenerateDocumentDialog
                isOpen={isDocumentDialogOpen}
                onOpenChange={setIsDocumentDialogOpen}
                candidateId={id!}
                vacancyId={documents?.[0]?.vacancy_id || undefined}
                documentType={documentType}
                onDocumentTypeChange={setDocumentType}
                additionalInfo={additionalInfo}
                onAdditionalInfoChange={setAdditionalInfo}
              />
              <GenerateStructuredInterviewDialog
                candidateId={id!}
                // TODO: Pass a relevant vacancy ID. Using a placeholder for now.
                vacancyId={documents?.[0]?.vacancy_id || ''}
                disabled={!analysis}
              />
              {!analysis && (
                <p className="text-xs text-muted-foreground pt-1">
                  {t('profile.actionsCard.interviewDisabledTooltip')}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.detailsCard.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>{t('profile.detailsCard.email')}:</strong> {candidate?.id}</p>
              <p><strong>{t('profile.detailsCard.phone')}:</strong> {candidate?.phone || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.experience')}:</strong> {candidate?.experience || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.education')}:</strong> {candidate?.education || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.about')}:</strong> {candidate?.about || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.testsCompleted')}:</strong> {candidate?.tests_completed || 0}/6</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
