import { useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UploadCloud, FileText, X, ChevronsUpDown, Check, Loader2, Briefcase, Sparkles, Languages, FileType2 } from 'lucide-react'
import { useGetVacancies } from '@/features/vacancy-management/api/getVacancies'
import { useSettingsStore } from '@/app/store/settings'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useAnalyzeResumes, type AnalyzeResumesResponse } from '../api/analyzeResumes'
import { useTokenCalculation } from '@/shared/hooks/useTokenCalculation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/shared/lib/supabase'
import { AIGenerationModal } from '@/shared/ui/AIGenerationModal'
import { GlassCard } from '@/shared/ui/GlassCard'
import { ResumeAnalysisHistory } from './ResumeAnalysisHistory'
import { ResumeAnalysisResult } from './ResumeAnalysisResult'
import type { AnalysisResult, AnalysisData, AnalysisCandidate } from '../types'
import { TokenCostBanner } from '@/shared/ui/TokenCostBanner'
import { HelpCircle } from '@/shared/ui/HelpCircle'
const CHUNK_SIZE = 5;
const ANALYSIS_STORAGE_KEY = 'resume_analysis_current_result';

export const ResumeAnalysis = () => {
  const { t } = useTranslation(['ai-analysis', 'common'])
  const { language } = useSettingsStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [files, setFiles] = useState<File[]>([])
  const [selectedVacancies, setSelectedVacancies] = useState<string[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [resultLanguage, setResultLanguage] = useState(language)
  const [openPopover, setOpenPopover] = useState(false)
  
  // Initialize from sessionStorage if viewing result
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() => {
    const view = searchParams.get('view')
    if (view === 'result') {
      const stored = sessionStorage.getItem(ANALYSIS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  // Helper functions for result management
  const setResultAndNavigate = (result: AnalysisResult) => {
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(result))
    setAnalysisResult(result)
    setSearchParams(prev => {
      prev.set('view', 'result')
      return prev
    })
  }

  const clearResultAndNavigate = () => {
    sessionStorage.removeItem(ANALYSIS_STORAGE_KEY)
    setAnalysisResult(null)
    setSearchParams(prev => {
      prev.delete('view')
      return prev
    })
  }

  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [accumulatedTokens, setAccumulatedTokens] = useState(0)

  const { data: vacanciesData, isLoading: isLoadingVacancies } = useGetVacancies()
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()
  const { calculation } = useTokenCalculation('resume_analysis', undefined, files.length || 1)

  const analyzeResumesMutation = useAnalyzeResumes({
    onSuccess: (data: AnalyzeResumesResponse) => {
      // For single chunks, we set result immediately
      if (files.length <= CHUNK_SIZE && data.result) {
        toast.success(t('resumeAnalysis.notifications.successTitle'))
        setResultAndNavigate(data.result as AnalysisResult)
      }
    },
    onError: (error: Error) => {
      toast.error(t('resumeAnalysis.notifications.errorTitle'), {
        description: error.message,
      })
    },
  })

  const onDrop = (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > 20) {
      toast.error(t('maxFilesError'))
      return
    }
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles.filter(af => !prevFiles.some(pf => pf.name === af.name))])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName))
  }

  const uploadFilesChunk = async (chunkFiles: File[], globalIndex: number, totalFiles: number): Promise<string[]> => {
    const filePaths: string[] = []
    
    for (let i = 0; i < chunkFiles.length; i++) {
      const file = chunkFiles[i]
      const current = globalIndex + i + 1
      
      setUploadStatus(t('resumeAnalysis.uploadProgress.uploading', {
        current,
        total: totalFiles,
        filename: file.name
      }))
      
      // Sanitize filename and make it unique
      const timestamp = new Date().getTime()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${organization?.id}/${timestamp}_${sanitizedName}`
      
      const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)
        
      if (error) throw error
      
      filePaths.push(filePath)
      // Upload progress contributes to 50% of total progress in chunk processing
      const progress = Math.round((current / totalFiles) * 50)
      setUploadProgress(progress)
    }
    
    return filePaths
  }

  const handleAnalyze = async () => {
    if (!hrProfile || !organization || files.length === 0 || selectedVacancies.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setAccumulatedTokens(0)

    try {
      // Use chunking logic regardless of file count for consistency, but if small enough just one chunk
      const chunks = []
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        chunks.push(files.slice(i, i + CHUNK_SIZE))
      }

      let allCandidates: AnalysisCandidate[] = []
      let combinedMarkdown = ''
      let combinedHtml = ''
      const allFilePaths: string[] = []

      const isMultiChunk = chunks.length > 1;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const globalStartIndex = i * CHUNK_SIZE
        
        // 1. Upload Chunk
        const chunkFilePaths = await uploadFilesChunk(chunk, globalStartIndex, files.length)
        allFilePaths.push(...chunkFilePaths)

        // 2. Analyze Chunk
        setUploadStatus(t('resumeAnalysis.uploadProgress.analyzing') + (isMultiChunk ? ` (${i + 1}/${chunks.length})` : ''))
        
        // Update progress base (50% is upload, next 50% is analysis distributed by chunks)
        const baseAnalysisProgress = 50
        const chunkProgressShare = 50 / chunks.length
        setUploadProgress(baseAnalysisProgress + (i * chunkProgressShare))

        const result = await analyzeResumesMutation.mutateAsync({
          organization_id: organization.id,
          hr_specialist_id: hrProfile.id,
          vacancy_ids: selectedVacancies,
          file_paths: chunkFilePaths,
          additional_notes: additionalNotes,
          language: resultLanguage,
          save_to_db: !isMultiChunk // Save to DB only if single chunk
        })

        if (!result || !result.success) throw new Error("No result from analysis");

        if (isMultiChunk) {
            // Merge data from chunks
            const data = result.data; // Now typed correctly
            if (data?.analysis_data?.candidates) {
                allCandidates = [...allCandidates, ...data.analysis_data.candidates];
                combinedMarkdown += (data.content_markdown || '') + '\n\n---\n\n';
                combinedHtml += (data.content_html || '') + '<hr/>';
                // Accumulate tokens for multi-chunk
                if (result.total_tokens) {
                  setAccumulatedTokens(prev => prev + (result.total_tokens || 0));
                }
            }
        }
      }

      // 3. Finalize Multi-Chunk
      if (isMultiChunk) {
        setUploadStatus(t('common:saving', 'Сохранение...'))
        setUploadProgress(95)

        const mergedAnalysisData: AnalysisData = { candidates: allCandidates };
        
        // Insert merged result
        const { data: savedResult, error } = await supabase
            .from('resume_analysis_results')
            .insert({
                organization_id: organization.id,
                created_by_hr_id: hrProfile.id,
                vacancy_ids: selectedVacancies,
                resume_count: files.length,
                content_markdown: combinedMarkdown,
                content_html: combinedHtml,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                analysis_data: mergedAnalysisData as any,
                file_paths: allFilePaths
            })
            .select()
            .single()

        if (error) throw error;

        setResultAndNavigate(savedResult as unknown as AnalysisResult)
        toast.success(t('resumeAnalysis.notifications.successTitle'))
      }

    } catch (error) {
      console.error('Analysis error:', error)
      toast.error(t('resumeAnalysis.notifications.errorTitle'), {
        description: (error as Error).message,
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const selectedVacanciesDetails = useMemo(() => {
    return vacanciesData?.filter(v => selectedVacancies.includes(v.id)) ?? []
  }, [selectedVacancies, vacanciesData])

  if (analysisResult && searchParams.get('view') === 'result') {
    return (
      <ResumeAnalysisResult
        result={analysisResult}
        onBack={clearResultAndNavigate}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <AIGenerationModal
        isOpen={isUploading || analyzeResumesMutation.isPending}
        onOpenChange={() => {}} // Locked
        isPending={isUploading || analyzeResumesMutation.isPending}
        title={isUploading ? t('resumeAnalysis.uploadingTitle', 'Загрузка файлов') : t('resumeAnalysis.processingTitle', 'Анализ резюме')}
        description={isUploading ? uploadStatus : t('resumeAnalysis.processingDescription', 'ИИ анализирует резюме и сопоставляет их с вакансиями...')}
        progress={isUploading ? uploadProgress : undefined}
        simulationMode="slow"
        finalTokens={accumulatedTokens || analyzeResumesMutation.data?.result?.total_tokens || analyzeResumesMutation.data?.total_tokens}
      />
      <div className="lg:col-span-2 order-1">
        <GlassCard className="overflow-hidden border shadow-lg bg-card/50">
          <div className="p-4 sm:p-8 border-b">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-2xl font-bold truncate">
                    {t('resumeAnalysis.title')}
                  </h2>
                  <HelpCircle topicId="resume_analysis" iconClassName="h-5 w-5" />
                </div>
                <p className="text-xs sm:text-base text-muted-foreground mt-0.5 sm:mt-1 line-clamp-3 sm:line-clamp-none">
                  {t('resumeAnalysis.description')}
                </p>
              </div>
            </div>
          </div>
          
          <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Briefcase className="w-4 h-4" />
                <h3>{t('resumeAnalysis.selectVacancies.label')}</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">max 7</span>
              </div>
              
              <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPopover}
                    className="w-full justify-between h-auto min-h-[48px] px-4 rounded-xl hover:bg-accent/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-wrap gap-2">
                      {selectedVacanciesDetails.length > 0 ? (
                        selectedVacanciesDetails.map(v => (
                          <Badge
                            key={v.id}
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1"
                          >
                            {v.title}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground font-normal">{t('resumeAnalysis.selectVacancies.placeholder')}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl shadow-xl border-primary/10" align="start">
                  <Command>
                    <CommandInput placeholder={t('resumeAnalysis.selectVacancies.searchPlaceholder')} className="h-12" />
                    <CommandEmpty>{isLoadingVacancies ? t('common:loading') : t('common:noResults')}</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {vacanciesData?.map((vacancy) => (
                        <CommandItem
                          key={vacancy.id}
                          value={vacancy.title}
                          onSelect={() => {
                            const isSelected = selectedVacancies.includes(vacancy.id)
                            if (isSelected) {
                              setSelectedVacancies(selectedVacancies.filter(id => id !== vacancy.id))
                            } else if (selectedVacancies.length < 7) {
                              setSelectedVacancies([...selectedVacancies, vacancy.id])
                            }
                          }}
                          className="py-3 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-primary transition-opacity",
                              selectedVacancies.includes(vacancy.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {vacancy.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <UploadCloud className="w-4 h-4" />
                  <h3>{t('resumeAnalysis.uploadResumes.label')}</h3>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full transition-colors",
                  files.length >= 20 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                )}>
                  {files.length} / 20
                </span>
              </div>
              
              <div
                {...getRootProps()}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out min-h-[200px]",
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[1.01] shadow-lg ring-2 ring-primary/20"
                    : "border-border/60 hover:border-primary/50 hover:bg-muted/30",
                  files.length > 0 ? "p-4" : "p-10 flex flex-col items-center justify-center text-center"
                )}
              >
                <input {...getInputProps()} />
                
                {files.length > 0 ? (
                  <div className="space-y-4 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {files.map((file) => (
                        <div
                          key={file.name}
                          className="group relative flex items-center gap-3 p-3 bg-background/80 backdrop-blur-sm border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500">
                            <FileType2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-sm bg-background border"
                            onClick={() => removeFile(file.name)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {files.length < 20 && (
                      <div className="flex items-center justify-center py-6 border-2 border-dashed border-muted-foreground/10 rounded-xl hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                          <UploadCloud className="h-6 w-6 mb-1 animate-bounce duration-1000" />
                          <span className="text-sm font-medium">{t('resumeAnalysis.uploadResumes.dropFiles')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 transition-transform duration-500",
                      isDragActive ? "scale-110" : "group-hover:scale-105"
                    )}>
                      <UploadCloud className={cn(
                        "h-10 w-10 text-primary transition-all duration-500",
                        isDragActive ? "scale-110" : ""
                      )} />
                    </div>
                    {isDragActive ? (
                      <p className="font-semibold text-lg text-primary animate-pulse">{t('resumeAnalysis.uploadResumes.dropFiles')}</p>
                    ) : (
                      <>
                        <p className="font-medium text-lg mb-2">{t('resumeAnalysis.uploadResumes.dragAndDrop')}</p>
                        <p className="text-sm text-muted-foreground max-w-xs">{t('resumeAnalysis.uploadResumes.fileRequirements', 'PDF, DOC, DOCX файлы, до 5MB каждый, максимум 20 файлов.')}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <h3>{t('resumeAnalysis.additionalNotes.label')}</h3>
                </div>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder={t('resumeAnalysis.additionalNotes.placeholder')}
                  rows={4}
                  className="resize-none rounded-xl focus-visible:ring-primary/50"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Languages className="w-4 h-4" />
                  <h3>{t('resumeAnalysis.resultLanguage.label')}</h3>
                </div>
                <Select value={resultLanguage} onValueChange={(value) => setResultLanguage(value as 'ru' | 'kk' | 'en')}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={t('resumeAnalysis.resultLanguage.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">🇷🇺 {t('languages.ru')}</SelectItem>
                    <SelectItem value="en">🇺🇸 {t('languages.en')}</SelectItem>
                    <SelectItem value="kk">🇰🇿 {t('languages.kk')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      <div className="order-2 lg:sticky lg:top-24 space-y-6">
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('resumeAnalysis.summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <TokenCostBanner
              operationType="resume_analysis"
              multiplier={files.length || 1}
            />

            <Button
              onClick={handleAnalyze}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02]"
              size="lg"
              disabled={
                files.length === 0 ||
                selectedVacancies.length === 0 ||
                isUploading ||
                analyzeResumesMutation.isPending ||
                !calculation?.hasEnough
              }
            >
              {isUploading || analyzeResumesMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {t('resumeAnalysis.analyzeButton')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 order-3">
        <ResumeAnalysisHistory onViewAnalysis={setResultAndNavigate} />
      </div>
    </div>
  )
}
