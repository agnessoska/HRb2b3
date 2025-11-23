import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, User, ThumbsUp, ThumbsDown, MinusCircle, CheckCircle2, XCircle } from 'lucide-react'
import { AIBorder } from '@/shared/ui/AIBorder'
import { AIStreamingText } from '@/shared/ui/AIStreamingText'
import { Progress } from '@/components/ui/progress'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface AnalysisCandidate {
  name: string
  match_score: number
  summary: string
  pros: string[]
  cons: string[]
  verdict: 'recommended' | 'maybe' | 'rejected'
  vacancy_matches: {
    vacancy_title: string
    score: number
    reason: string
  }[]
}

interface AnalysisData {
  candidates: AnalysisCandidate[]
}

interface AnalysisResult {
  id: string
  created_at: string
  content_html: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis_data: any
}

interface ResumeAnalysisResultProps {
  result: AnalysisResult
  onBack: () => void
}

export const ResumeAnalysisResult = ({ result, onBack }: ResumeAnalysisResultProps) => {
  const { t } = useTranslation(['ai-analysis', 'common'])
  const contentRef = useRef<HTMLDivElement>(null)

  const analysisData = result.analysis_data as AnalysisData | null

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`resume-analysis-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF', error)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'recommended': return 'bg-success/10 text-success border-success/20'
      case 'maybe': return 'bg-warning/10 text-warning border-warning/20'
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'recommended': return <ThumbsUp className="w-4 h-4" />
      case 'maybe': return <MinusCircle className="w-4 h-4" />
      case 'rejected': return <ThumbsDown className="w-4 h-4" />
      default: return null
    }
  }

  if (!analysisData?.candidates) {
    // Fallback to HTML content if no JSON data
    return (
      <div className="space-y-6">
        <AIBorder>
          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    <AIStreamingText text={t('resumeAnalysis.result.title')} isStreaming={false} />
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common:back')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: result.content_html || '' }}
              />
            </CardContent>
          </Card>
        </AIBorder>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {t('resumeAnalysis.result.title')}
          </h2>
        </div>
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('common:downloadPDF', 'Скачать PDF')}
        </Button>
      </div>

      <div ref={contentRef} className="bg-background p-4 sm:p-8 rounded-xl">
        <div className="space-y-8">
          {analysisData.candidates.map((candidate, index) => (
            <Card key={index} className="overflow-hidden border-border/50 shadow-sm">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{candidate.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getVerdictColor(candidate.verdict)}>
                          <span className="flex items-center gap-1">
                            {getVerdictIcon(candidate.verdict)}
                            <span className="capitalize">{candidate.verdict}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="flex-1 text-right">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Match Score</div>
                      <div className="text-2xl font-bold text-primary">{candidate.match_score}%</div>
                    </div>
                    <div className="h-14 w-14 relative flex items-center justify-center">
                      <svg className="transform -rotate-90 w-full h-full">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-muted/20"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - candidate.match_score / 100)}
                          className="text-primary transition-all duration-1000 ease-out"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 p-4 rounded-xl">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {candidate.summary}
                  </p>
                </div>

                {/* Vacancy Matches */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Matches</h4>
                  <div className="grid gap-3">
                    {candidate.vacancy_matches.map((match, i) => (
                      <div key={i} className="bg-card border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{match.vacancy_title}</span>
                          <span className="font-bold text-primary">{match.score}%</span>
                        </div>
                        <Progress value={match.score} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">{match.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm text-success mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Pros
                    </h4>
                    <ul className="space-y-2">
                      {candidate.pros.map((pro, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-success/50 mt-1.5 shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-destructive mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Cons
                    </h4>
                    <ul className="space-y-2">
                      {candidate.cons.map((con, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 mt-1.5 shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}