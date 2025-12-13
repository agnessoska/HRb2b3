import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Briefcase,
  XCircle,
  ArrowLeft,
  Download,
  Share2,
  Loader2,
  Check,
  Edit2,
  Save,
  MessageCircle,
  MessageSquare
} from 'lucide-react'
import { AIBorder } from '@/shared/ui/AIBorder'
import { GlassCard } from '@/shared/ui/GlassCard'
import type { GeneratedDocumentResult } from '../types'
import { useState, useEffect } from 'react'
import { RichTextEditor } from '@/shared/ui/RichTextEditor'
import { supabase } from '@/shared/lib/supabase'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { marked } from 'marked'

interface DocumentViewProps {
  document: GeneratedDocumentResult
  onBack: () => void
  onShare?: () => void
  isSharing?: boolean
}

const documentTypeConfig = {
  interview_invitation: {
    icon: Mail,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  job_offer: {
    icon: Briefcase,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  rejection_letter: {
    icon: XCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  structured_interview: {
    icon: MessageSquare,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
}

export const DocumentView = ({
  document,
  onBack,
  onShare,
  isSharing = false
}: DocumentViewProps) => {
  const { t } = useTranslation(['ai-analysis', 'common'])
  const [showCopied, setShowCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(document.content_markdown || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingToChat, setIsSendingToChat] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const config = documentTypeConfig[document.document_type]
  const Icon = config.icon

  useEffect(() => {
    const initializeContent = async () => {
      let content = ''
      if (document.content_markdown) {
        content = document.content_markdown
      } else if (document.document_data) {
        content = JSON.stringify(document.document_data, null, 2)
      }

      try {
        const html = await marked.parse(content)
        setEditedContent(html)
      } catch (e) {
        console.error('Failed to parse markdown', e)
        setEditedContent(content)
      }
    }
    
    initializeContent()
  }, [document.content_markdown, document.document_data])

  const handleShareClick = () => {
    if (onShare) {
      onShare()
      if (!isSharing) {
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('generated_documents')
        .update({
          content_markdown: editedContent,
        })
        .eq('id', document.id)

      if (error) throw error

      toast.success(t('common:saved', 'Сохранено'))
      setIsEditing(false)
      
      await queryClient.invalidateQueries({ queryKey: ['documents', document.candidate_id] })
    } catch (error) {
      console.error('Failed to save document:', error)
      toast.error(t('common:error', 'Произошла ошибка'))
    } finally {
      setIsSaving(false)
    }
  }

  const generatePDFBlob = async (): Promise<Blob> => {
    const element = window.document.createElement('div')
    element.innerHTML = `
      <style>
        body { font-family: 'Inter', sans-serif; color: #000; }
        h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
        h2 { font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; }
        h3 { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
        p { font-size: 14px; line-height: 1.6; margin-bottom: 12px; page-break-inside: avoid; }
        ul, ol { margin-bottom: 12px; padding-left: 20px; }
        li { font-size: 14px; line-height: 1.6; margin-bottom: 6px; page-break-inside: avoid; }
        h1, h2, h3 { page-break-after: avoid; }
        hr { border: 0; border-top: 1px solid #ccc; margin: 20px 0; }
        strong { font-weight: bold; }
        
        /* Table styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          page-break-inside: auto;
        }
        thead {
          display: table-header-group;
          background-color: #f3f4f6;
        }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th, td {
          border: 1px solid #d1d5db;
          padding: 12px;
          text-align: left;
          font-size: 13px;
          line-height: 1.5;
        }
        th {
          font-weight: bold;
          background-color: #f3f4f6;
        }
        td { background-color: #ffffff; }
      </style>
      ${editedContent}
    `
    element.className = 'p-8 bg-white text-black'
    
    // Using a container to hold the element, similar to handleDownloadPDF
    const container = window.document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '210mm'
    container.style.zIndex = '-1000'
    // Do NOT set opacity to 0, as some browsers optimize this out of rendering tree for screenshots
    container.appendChild(element)
    window.document.body.appendChild(container)

    const opt = {
      margin: 10,
      filename: `${document.title}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Force a small delay to allow rendering
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob')
      window.document.body.removeChild(container)
      return pdfBlob
    } catch (e) {
      if (window.document.body.contains(container)) {
        window.document.body.removeChild(container)
      }
      throw e
    }
  }

  const handleSendToChat = async () => {
    setIsSendingToChat(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      const { data: hrProfile } = await supabase
        .from('hr_specialists')
        .select('id, organization_id')
        .eq('user_id', user.id)
        .single()

      if (!hrProfile) throw new Error('No HR profile')

      let roomId
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('hr_specialist_id', hrProfile.id)
        .eq('candidate_id', document.candidate_id)
        .single()

      if (existingRoom) {
        roomId = existingRoom.id
      } else {
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            hr_specialist_id: hrProfile.id,
            candidate_id: document.candidate_id,
            organization_id: hrProfile.organization_id
          })
          .select('id')
          .single()
        
        if (createError) throw createError
        roomId = newRoom.id
      }

      // First save any unsaved changes
      if (editedContent !== document.content_markdown) {
        await handleSave()
      }

      // Determine language for the message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docLanguage = (document.document_data as any)?.language || 'ru'
      
      // Map of "Please review" messages by language
      const messages: Record<string, string> = {
        ru: 'Пожалуйста, ознакомьтесь с документом',
        en: 'Please review this document',
        kk: 'Осы құжатпен танысып шығыңыз'
      }
      
      // Use the document language if available, fallback to current translation or 'ru'
      let messageText = messages[docLanguage] || t('documents.checkDocument', 'Пожалуйста, ознакомьтесь с документом')
      let attachmentUrl = null
      let attachmentName = null
      let attachmentType = null

      if (document.is_public) {
         const publicUrl = `${window.location.origin}/public/document/${document.id}`
         messageText = `${messageText}: ${publicUrl}`
      } else {
        // Generate PDF
        const pdfBlob = await generatePDFBlob()
        
        if (pdfBlob) {
          const fileName = `${document.title}.pdf`
          const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
          // Upload to 'chat-attachments' bucket which we know exists and has RLS policies
          const filePath = `${roomId}/${Date.now()}_${cleanFileName}`
          
          const { error: uploadError } = await supabase.storage
            .from('chat-attachments')
            .upload(filePath, pdfBlob, {
              contentType: 'application/pdf',
              upsert: true
            })

          if (uploadError) {
            console.error('Upload error:', uploadError)
            // If upload fails, just send text message content as fallback or notify user
            toast.error(t('documents.uploadError', 'Не удалось загрузить PDF'))
            throw uploadError
          }

          const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(filePath)

          attachmentUrl = publicUrl
          attachmentName = fileName
          attachmentType = 'application/pdf'
        }
      }

      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: roomId,
          sender_id: user.id,
          sender_type: 'hr',
          message_text: messageText,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType
        })

      if (msgError) throw msgError

      toast.success(t('documents.sentToChat', 'Отправлено в чат'))
      navigate(`/hr/chat?candidateId=${document.candidate_id}`)

    } catch (error) {
      console.error('Failed to send to chat:', error)
      toast.error(t('common:error', 'Произошла ошибка'))
    } finally {
      setIsSendingToChat(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const element = window.document.createElement('div')
      element.innerHTML = `
        <style>
          body { font-family: 'Inter', sans-serif; color: #000; }
          h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
          h2 { font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; }
          h3 { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
          p { font-size: 14px; line-height: 1.6; margin-bottom: 12px; page-break-inside: avoid; }
          ul, ol { margin-bottom: 12px; padding-left: 20px; }
          li { font-size: 14px; line-height: 1.6; margin-bottom: 6px; page-break-inside: avoid; }
          h1, h2, h3 { page-break-after: avoid; }
          hr { border: 0; border-top: 1px solid #ccc; margin: 20px 0; }
          strong { font-weight: bold; }
          
          /* Table styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            page-break-inside: auto;
          }
          thead {
            display: table-header-group;
            background-color: #f3f4f6;
          }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            line-height: 1.5;
          }
          th {
            font-weight: bold;
            background-color: #f3f4f6;
          }
          td { background-color: #ffffff; }
        </style>
        ${editedContent}
      `
      element.className = 'p-8 bg-white text-black'
      
      // For download, we can make it visible momentarily but positioned fixed top left
      const container = window.document.createElement('div')
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '210mm'
      container.style.zIndex = '-1000'
      container.style.opacity = '0'
      container.appendChild(element)
      window.document.body.appendChild(container)

      const opt = {
        margin: 10,
        filename: `${document.title}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Force a small delay to allow rendering
      await new Promise(resolve => setTimeout(resolve, 100))
      
      await html2pdf().set(opt).from(element).save()
      window.document.body.removeChild(container)
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error(t('common:error', 'Ошибка генерации PDF'))
    } finally {
        setIsDownloading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common:back')}
        </Button>
        
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                {t('common:cancel', 'Отмена')}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('common:save', 'Сохранить')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {t('common:edit', 'Редактировать')}
              </Button>
              {document.document_type !== 'structured_interview' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendToChat}
                  disabled={isSendingToChat}
                  className="gap-2"
                >
                  {isSendingToChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  {t('documents.sendToChat', 'В чат')}
                </Button>
              )}
              {onShare && (
                <Button
                  onClick={handleShareClick}
                  variant="outline"
                  size="sm"
                  className="gap-2 min-w-[140px]"
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : showCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('common:copied', 'Скопировано')}
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      {document.is_public ? t('common:copyLink', 'Скопировать ссылку') : t('common:share')}
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleDownloadPDF}
                size="sm"
                disabled={isDownloading}
                className="gap-2"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {t('common:downloadPdf')}
              </Button>
            </>
          )}
        </div>
      </div>

      <AIBorder>
        <GlassCard className="border-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {t(`generateDocument.documentType.${document.document_type}`)}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className={config.bgColor}>
                {t(`documents.types.${document.document_type}`, document.document_type)}
              </Badge>
            </div>
          </CardHeader>
        </GlassCard>
      </AIBorder>

      <Card>
        <CardContent className="p-6">
          {isEditing ? (
            <RichTextEditor
              value={editedContent}
              onChange={setEditedContent}
              className="min-h-[500px]"
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:w-4 [&_input[type=checkbox]]:h-4">
              {document.content_markdown && document.content_markdown.trim().startsWith('<') ? (
                // If content looks like HTML (from Tiptap), render as HTML
                <div dangerouslySetInnerHTML={{ __html: document.content_markdown }} />
              ) : (
                // If content looks like Markdown (initial generation), render as Markdown
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {document.content_markdown || ''}
                </ReactMarkdown>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}