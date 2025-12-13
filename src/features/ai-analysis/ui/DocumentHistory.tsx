import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Eye, Mail, Briefcase, XCircle, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { GeneratedDocumentResult } from '../types'

interface DocumentHistoryProps {
  documents: GeneratedDocumentResult[]
  onView: (document: GeneratedDocumentResult) => void
}

const documentTypeIcons = {
  interview_invitation: Mail,
  job_offer: Briefcase,
  rejection_letter: XCircle,
  structured_interview: MessageSquare,
}

const documentTypeColors = {
  interview_invitation: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  job_offer: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  rejection_letter: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  structured_interview: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
}

export const DocumentHistory = ({ documents, onView }: DocumentHistoryProps) => {
  const { t } = useTranslation(['ai-analysis', 'common'])

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground text-sm">
            {t('documents.history.empty', 'История документов пуста')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => {
        const Icon = documentTypeIcons[document.document_type]
        const colorClass = documentTypeColors[document.document_type]
        
        return (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-10 w-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className={colorClass}>
                        {t(`generateDocument.documentType.${document.document_type}`)}
                      </Badge>
                      {document.is_public && (
                        <Badge variant="outline" className="text-xs">
                          {t('documents.history.public', 'Публичный')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(document.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(document)}
                  className="gap-2 shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  {t('common:view')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}