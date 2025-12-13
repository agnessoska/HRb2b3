import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { ModeToggle } from '@/shared/ui/ModeToggle'
import type { GeneratedDocumentResult } from '@/features/ai-analysis/types'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent } from '@/components/ui/card'

export default function PublicDocumentPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['common', 'ai-analysis'])

  const { data: document, isLoading, isError } = useQuery({
    queryKey: ['public-document', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('id', id!)
        .eq('is_public', true)
        .single()

      if (error) throw error
      return data as GeneratedDocumentResult
    },
    enabled: !!id,
  })

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton className="h-12 w-1/2" />
          <div className="mt-8 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </>
      )
    }

    if (isError || !document) {
      return (
        <Alert variant="destructive">
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>
            {t('ai-analysis:fullAnalysis.notFoundOrPrivate', 'Документ не найден или не является публичным')}
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {document.content_markdown && document.content_markdown.trim().startsWith('<') ? (
              <div dangerouslySetInnerHTML={{ __html: document.content_markdown }} />
            ) : (
              <ReactMarkdown>
                {document.content_markdown || ''}
              </ReactMarkdown>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">
              {document?.title || t('ai-analysis:documents.title', 'Документ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-4xl">
        {renderContent()}
      </main>
    </div>
  )
}