import { useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FileSearch, UploadCloud, FileText, X, ChevronsUpDown, Check, Loader2 } from 'lucide-react'
import { useGetVacancies } from '@/features/vacancy-management/api/getVacancies'
import { useSettingsStore } from '@/app/store/settings'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useAnalyzeResumes } from '../api/analyzeResumes'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface AnalysisResult {
  id: string;
  content_html: string;
  content_markdown: string;
  created_at: string;
}

export const ResumeAnalysis = () => {
  const { t } = useTranslation(['ai-analysis', 'common'])
  const { language } = useSettingsStore()
  const [files, setFiles] = useState<File[]>([])
  const [selectedVacancies, setSelectedVacancies] = useState<string[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [resultLanguage, setResultLanguage] = useState(language)
  const [openPopover, setOpenPopover] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const { data: vacanciesData, isLoading: isLoadingVacancies } = useGetVacancies()
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()

  const analyzeResumesMutation = useAnalyzeResumes({
    onSuccess: (data) => {
      toast.success(t('resumeAnalysis.notifications.successTitle'))
      if (data && data.result) {
        setAnalysisResult(data.result as AnalysisResult)
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
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const resetForm = () => {
    setFiles([])
    setSelectedVacancies([])
    setAdditionalNotes('')
    setAnalysisResult(null)
  }

  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName))
  }

  const handleAnalyze = async () => {
    if (!hrProfile || !organization || files.length === 0 || selectedVacancies.length === 0) return

    const resumes = await Promise.all(
      files.map(async (file) => {
        const content_base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = (error) => reject(error)
        })
        return { filename: file.name, content_base64 }
      })
    )

    analyzeResumesMutation.mutate({
      organization_id: organization.id,
      hr_specialist_id: hrProfile.id,
      vacancy_ids: selectedVacancies,
      resumes,
      additional_notes: additionalNotes,
      language: resultLanguage,
    })
  }

  const selectedVacanciesDetails = useMemo(() => {
    return vacanciesData?.filter(v => selectedVacancies.includes(v.id)) ?? []
  }, [selectedVacancies, vacanciesData])

  if (analysisResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t('resumeAnalysis.result.title')}</CardTitle>
                <CardDescription>
                  {t('resumeAnalysis.result.description', { date: new Date(analysisResult.created_at).toLocaleString() })}
                </CardDescription>
              </div>
              <Button onClick={resetForm}>
                {t('resumeAnalysis.result.newAnalysisButton')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: analysisResult.content_html }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('resumeAnalysis.title')}</CardTitle>
            <CardDescription>{t('resumeAnalysis.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{t('resumeAnalysis.selectVacancies.label')} (max. 7)</h3>
              <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPopover}
                    className="w-full justify-between h-auto min-h-[40px]"
                  >
                    <div className="flex flex-wrap gap-1">
                      {selectedVacanciesDetails.length > 0 ? (
                        selectedVacanciesDetails.map(v => <Badge key={v.id} variant="secondary">{v.title}</Badge>)
                      ) : (
                        <span className="text-muted-foreground font-normal">{t('resumeAnalysis.selectVacancies.placeholder')}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder={t('resumeAnalysis.selectVacancies.searchPlaceholder')} />
                    <CommandEmpty>{isLoadingVacancies ? t('common:loading') : t('common:noResults')}</CommandEmpty>
                    <CommandGroup>
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
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
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

            <div>
              <h3 className="font-semibold mb-2">{t('resumeAnalysis.uploadResumes.label')} (max. 20)</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                  {isDragActive ? (
                    <p className="font-semibold">{t('resumeAnalysis.uploadResumes.dropFiles')}</p>
                  ) : (
                    <p>{t('resumeAnalysis.uploadResumes.dragAndDrop')}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{t('resumeAnalysis.uploadResumes.fileRequirements')}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('resumeAnalysis.additionalNotes.label')}</h3>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={t('resumeAnalysis.additionalNotes.placeholder')}
                rows={4}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('resumeAnalysis.resultLanguage.label')}</h3>
              <Select value={resultLanguage} onValueChange={(value) => setResultLanguage(value as 'ru' | 'kk' | 'en')}>
                <SelectTrigger>
                  <SelectValue placeholder={t('resumeAnalysis.resultLanguage.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">{t('languages.ru')}</SelectItem>
                  <SelectItem value="en">{t('languages.en')}</SelectItem>
                  <SelectItem value="kk">{t('languages.kk')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('resumeAnalysis.summary.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">{t('resumeAnalysis.summary.uploadedFiles')} ({files.length}/20)</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {files.map(file => (
                    <div key={file.name} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.name)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <FileSearch className="h-4 w-4" />
              <AlertTitle>{t('resumeAnalysis.summary.cost.title')}</AlertTitle>
              <AlertDescription>
                {t('resumeAnalysis.summary.cost.description')}
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleAnalyze}
              className="w-full"
              size="lg"
              disabled={
                files.length === 0 ||
                selectedVacancies.length === 0 ||
                analyzeResumesMutation.isPending
              }
            >
              {analyzeResumesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('resumeAnalysis.analyzeButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
