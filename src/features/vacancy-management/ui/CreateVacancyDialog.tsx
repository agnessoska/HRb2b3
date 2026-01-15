import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from '@/components/ui/separator'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createVacancy } from '../api/createVacancy'
import { updateVacancy } from '../api/updateVacancy'
import { getVacancySkills } from '../api/getVacancySkills'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useTranslation } from 'react-i18next'
import { Plus, Loader2, Edit, Briefcase, DollarSign } from 'lucide-react'
import type { Database } from '@/shared/types/database'
import { SkillsMultiSelect } from '@/features/talent-market/ui/SkillsMultiSelect'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Vacancy = Database['public']['Tables']['vacancies']['Row']

const createVacancySchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t('validation.titleRequired')),
  description: z.string().min(1, t('validation.descriptionRequired')),
  requirements: z.string().min(1, t('validation.requirementsRequired')),
  skills: z.array(z.string()),
  currency: z.enum(['USD', 'KZT', 'RUB', 'EUR']),
  salary_min: z.string().optional().refine(val => !val || !isNaN(Number(val)), { message: "Must be a number" }),
  salary_max: z.string().optional().refine(val => !val || !isNaN(Number(val)), { message: "Must be a number" }),
  location: z.string().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'remote']),
})

export type VacancyDialogMode = 'create' | 'edit' | 'view';

interface CreateVacancyDialogProps {
  vacancyToEdit?: Vacancy | null
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onModeChange?: (mode: VacancyDialogMode) => void
  initialMode?: VacancyDialogMode
}

export function CreateVacancyDialog({
  vacancyToEdit,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  onModeChange,
  initialMode = 'create'
}: CreateVacancyDialogProps = {}) {
  const { t } = useTranslation('vacancies')
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = controlledOnOpenChange || setInternalIsOpen
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [currentMode, setCurrentMode] = useState<VacancyDialogMode>(initialMode)

  const queryClient = useQueryClient()
  const { data: organization } = useOrganization()
  const { data: hrProfile } = useHrProfile()

  const vacancySchema = createVacancySchema(t)

  const form = useForm<z.infer<typeof vacancySchema>>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      skills: [],
      currency: 'USD',
      employment_type: 'full-time',
      salary_min: '',
      salary_max: '',
      location: '',
    },
  })

  // Загружаем навыки при редактировании
  useEffect(() => {
    async function loadVacancyData() {
      if (isOpen && vacancyToEdit) {
        setIsLoadingSkills(true)
        try {
          const skillsData = await getVacancySkills(vacancyToEdit.id)
          const skills = skillsData.map(s => s.canonical_skill)
          form.reset({
            title: vacancyToEdit.title || '',
            description: vacancyToEdit.description || '',
            requirements: vacancyToEdit.requirements || '',
            skills: skills,
            employment_type: (vacancyToEdit.employment_type as 'full-time' | 'part-time' | 'remote') || 'full-time',
            currency: (vacancyToEdit.currency as 'USD' | 'KZT' | 'RUB' | 'EUR') || 'USD',
            salary_min: vacancyToEdit.salary_min?.toString() || '',
            salary_max: vacancyToEdit.salary_max?.toString() || '',
            location: vacancyToEdit.location || '',
          })
        } catch (error) {
          console.error('Error loading vacancy skills:', error)
          toast.error(t('dialog.errorLoadingSkills', 'Ошибка загрузки навыков'))
        } finally {
          setIsLoadingSkills(false)
        }
      } else if (isOpen && !vacancyToEdit) {
        form.reset({
          title: '',
          description: '',
          requirements: '',
          skills: [],
          employment_type: 'full-time',
          currency: 'USD',
          salary_min: '',
          salary_max: '',
          location: '',
        })
      }
    }
    
    loadVacancyData()
  }, [isOpen, vacancyToEdit, form, t])

  const initializedModeRef = useRef(false)

  // Синхронизируем режим при открытии
  useEffect(() => {
    if (isOpen) {
      if (!initializedModeRef.current) {
        setCurrentMode(initialMode)
        initializedModeRef.current = true
      }
    } else {
      initializedModeRef.current = false
    }
  }, [isOpen, initialMode])


  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createVacancy,
    onSuccess: (newVacancy) => {
      queryClient.setQueryData(['vacancies', organization?.id], (oldData: Vacancy[] | undefined) => {
        if (!oldData) return [newVacancy]
        return [newVacancy, ...oldData]
      })
      queryClient.invalidateQueries({ queryKey: ['vacancies', organization?.id] })
      toast.success(t('dialog.createSuccess', 'Вакансия успешно создана'))
      setIsOpen(false)
      form.reset()
    },
  })

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateVacancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', organization?.id] })
      toast.success(t('dialog.updateSuccess', 'Вакансия успешно обновлена'))
      setIsOpen(false)
      form.reset()
    },
  })

  function onSubmit(values: z.infer<typeof vacancySchema>) {
    if (!organization || !hrProfile) return

    const payload = {
      ...values,
      salary_min: values.salary_min ? Number(values.salary_min) : undefined,
      salary_max: values.salary_max ? Number(values.salary_max) : undefined,
    }
    
    if (vacancyToEdit) {
      update({
        id: vacancyToEdit.id,
        ...payload,
      })
    } else {
      create({
        ...payload,
        organization_id: organization.id,
        created_by_hr_id: hrProfile.id,
        status: 'active',
      })
    }
  }

  const isPending = isCreating || isUpdating
  const isViewMode = currentMode === 'view'
  const isDirty = form.formState.isDirty

  const handleModeChange = (newMode: VacancyDialogMode) => {
    setCurrentMode(newMode)
    onModeChange?.(newMode)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      {!controlledIsOpen && (
        <DialogTrigger asChild>
          <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
            <Plus className="h-4 w-4" />
            {t('create_new')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {isViewMode ? (
              <Briefcase className="h-6 w-6 text-primary" />
            ) : vacancyToEdit ? (
              <Edit className="h-6 w-6 text-primary" />
            ) : (
              <Plus className="h-6 w-6 text-primary" />
            )}
            {isViewMode
              ? t('dialog.view_title', 'Просмотр вакансии')
              : vacancyToEdit
                ? t('dialog.edit_title')
                : t('dialog.create_title')}
          </DialogTitle>
          <DialogDescription>
            {isViewMode
              ? t('dialog.view_description', 'Информация о вакансии.')
              : vacancyToEdit
                ? t('dialog.edit_description')
                : t('dialog.description')}
          </DialogDescription>
        </DialogHeader>

        {isLoadingSkills ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
              {/* Основная информация */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('dialog.sections.basic')}
                  </h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.form.title')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('dialog.form.title_placeholder')}
                          className="bg-card/50 border-border/50 focus:bg-card transition-colors"
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.form.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px] resize-none bg-card/50 border-border/50 focus:bg-card transition-colors"
                          placeholder={t('dialog.form.description_placeholder')}
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-border/50" />

              {/* Требования и навыки */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('dialog.sections.requirements')}
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.form.requirements')}</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[140px] resize-none bg-card/50 border-border/50 focus:bg-card transition-colors"
                          placeholder={t('dialog.form.requirements_placeholder')}
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.form.skills')}</FormLabel>
                      <FormControl>
                        {isViewMode ? (
                          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/30">
                            {field.value.length > 0 ? (
                              field.value.map(skill => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">{t('common:notSpecified')}</span>
                            )}
                          </div>
                        ) : (
                          <SkillsMultiSelect
                            selectedSkills={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-border/50" />

              {/* Условия работы */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('dialog.sections.details')}
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="employment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.form.employment_type')}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-3 gap-3"
                          disabled={isViewMode}
                        >
                          {['full-time', 'part-time', 'remote'].map((type) => (
                            <div key={type}>
                              <RadioGroupItem value={type} id={type} className="peer sr-only" />
                              <Label
                                htmlFor={type}
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-card/50 p-3 transition-all h-20 ${
                                  isViewMode ? 'cursor-default' : 'hover:bg-accent/50 hover:text-accent-foreground cursor-pointer'
                                } peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5`}
                              >
                                <Briefcase className="h-5 w-5 mb-1.5 opacity-70" />
                                <span className="text-xs font-medium text-center">
                                  {t(`dialog.form.employment_types.${type}`)}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    {t('salary.label')}
                  </Label>
                  <div className="flex items-start gap-3">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
                            <FormControl>
                              <SelectTrigger className="bg-card/50 border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="KZT">KZT</SelectItem>
                              <SelectItem value="RUB">RUB</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salary_min"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('salary.from')}
                              className="bg-card/50 border-border/50"
                              disabled={isViewMode}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground mt-2">—</span>
                    <FormField
                      control={form.control}
                      name="salary_max"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('salary.upTo')}
                              className="bg-card/50 border-border/50"
                              disabled={isViewMode}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dialog.form.location')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('dialog.form.location_placeholder')}
                          className="bg-card/50 border-border/50"
                          disabled={isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="hover:bg-accent/50"
                >
                  {t('cancel', { ns: 'common' })}
                </Button>
                {isViewMode ? (
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => handleModeChange('edit')}
                    className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t('actions.edit')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isPending || isLoadingSkills || (!isDirty && !!vacancyToEdit)}
                    className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {vacancyToEdit ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('dialog.form.save')}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('dialog.form.submit')}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
