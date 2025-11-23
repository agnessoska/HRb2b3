import { useState, useEffect } from 'react'
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
import { AnimatePresence, motion } from 'framer-motion'
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createVacancy } from '../api/createVacancy'
import { updateVacancy } from '../api/updateVacancy'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useTranslation } from 'react-i18next'
import { Plus, Loader2, Edit, Info, ListChecks, Settings2, MapPin, Briefcase } from 'lucide-react'
import type { Database } from '@/shared/types/database'
import { SkillsMultiSelect } from '@/features/talent-market/ui/SkillsMultiSelect'
import { cn } from '@/lib/utils'

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

interface CreateVacancyDialogProps {
  vacancyToEdit?: Vacancy | null
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateVacancyDialog({ vacancyToEdit, isOpen: controlledIsOpen, onOpenChange: controlledOnOpenChange }: CreateVacancyDialogProps = {}) {
  const { t } = useTranslation('vacancies')
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = controlledOnOpenChange || setInternalIsOpen

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
    },
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isStepChanging, setIsStepChanging] = useState(false)
  const steps = [
    { id: 0, label: t('dialog.steps.basic_info'), icon: Info },
    { id: 1, label: t('dialog.steps.requirements'), icon: ListChecks },
    { id: 2, label: t('dialog.steps.details'), icon: Settings2 }
  ]

  const nextStep = async () => {
    if (isStepChanging) return
    setIsStepChanging(true)
    
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await form.trigger(fieldsToValidate)
    
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
      // Debounce to prevent accidental double-clicks triggering the next action immediately
      setTimeout(() => setIsStepChanging(false), 300)
    } else {
      setIsStepChanging(false)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }
  
  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentStep < steps.length - 1) {
      nextStep()
    } else {
      form.handleSubmit(onSubmit)()
    }
  }

  const getFieldsForStep = (step: number): Array<keyof z.infer<typeof vacancySchema>> => {
    switch (step) {
      case 0: return ['title', 'description']
      case 1: return ['requirements', 'skills']
      case 2: return ['employment_type', 'salary_min', 'salary_max', 'location']
      default: return []
    }
  }

  useEffect(() => {
    if (isOpen && vacancyToEdit) {
      form.reset({
        title: vacancyToEdit.title || '',
        description: vacancyToEdit.description || '',
        requirements: vacancyToEdit.requirements || '',
        skills: [], // TODO: Load skills for edit mode (currently empty array as backend handles it)
        employment_type: (vacancyToEdit.employment_type as 'full-time' | 'part-time' | 'remote') || 'full-time',
        currency: (vacancyToEdit.currency as 'USD' | 'KZT' | 'RUB' | 'EUR') || 'USD',
        salary_min: vacancyToEdit.salary_min?.toString() || '',
        salary_max: vacancyToEdit.salary_max?.toString() || '',
        location: vacancyToEdit.location || '',
      })
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
  }, [isOpen, vacancyToEdit, form])


  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createVacancy,
    onSuccess: (newVacancy) => {
      queryClient.setQueryData(['vacancies', organization?.id], (oldData: Vacancy[] | undefined) => {
        if (!oldData) return [newVacancy]
        return [newVacancy, ...oldData]
      })
      queryClient.invalidateQueries({ queryKey: ['vacancies', organization?.id] })
      setIsOpen(false)
      form.reset()
      setCurrentStep(0)
    },
  })

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateVacancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', organization?.id] })
      setIsOpen(false)
      form.reset()
      setCurrentStep(0)
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

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setCurrentStep(0);
        }
      }}
    >
      {!controlledIsOpen && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('create_new')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl border-0 shadow-2xl">
        <div className="bg-primary/5 p-6 pb-8">
          <DialogHeader className="space-y-2 mb-6">
            <DialogTitle className="text-2xl font-bold text-primary">
              {vacancyToEdit ? t('dialog.edit_title') : t('dialog.create_title')}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {vacancyToEdit ? t('dialog.edit_description') : t('dialog.description')}
            </DialogDescription>
          </DialogHeader>
          
          {/* Modern Stepper */}
          <div className="relative flex items-center justify-between px-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full px-10 -z-10">
              <div className="h-1 bg-background/50 rounded-full w-full" />
            </div>
            
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                      isActive ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25" : 
                      isCompleted ? "bg-primary/80 text-primary-foreground" : "bg-background text-muted-foreground border-2 border-muted"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-semibold transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-6 pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-foreground/80">{t('dialog.form.title')}</FormLabel>
                          <FormControl>
                            <Input
                              className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:border-primary/30 focus:bg-background transition-all text-lg px-4"
                              placeholder={t('dialog.form.title_placeholder')}
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
                          <FormLabel className="text-base font-semibold text-foreground/80">{t('dialog.form.description')}</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[160px] rounded-2xl bg-secondary/30 border-transparent focus:border-primary/30 focus:bg-background transition-all resize-none p-4 text-base"
                              placeholder={t('dialog.form.description_placeholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-foreground/80">{t('dialog.form.requirements')}</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[240px] rounded-2xl bg-secondary/30 border-transparent focus:border-primary/30 focus:bg-background transition-all p-4 text-base"
                              placeholder={t('dialog.form.requirements_placeholder')}
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
                          <FormLabel className="text-base font-semibold text-foreground/80">{t('dialog.form.skills')}</FormLabel>
                          <FormControl>
                            <SkillsMultiSelect
                              selectedSkills={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="employment_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold text-foreground/80">{t('dialog.form.employment_type')}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-3 gap-4"
                            >
                              {['full-time', 'part-time', 'remote'].map((type) => (
                                <FormItem key={type}>
                                  <FormControl>
                                    <RadioGroupItem value={type} className="peer sr-only" />
                                  </FormControl>
                                  <FormLabel className="flex flex-col items-center justify-between rounded-2xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                    <Briefcase className="mb-2 h-6 w-6 opacity-80" />
                                    <span className="text-sm font-medium text-center">
                                      {t(`dialog.form.employment_types.${type}`)}
                                    </span>
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground/80">{t('salary.label')}</Label>
                      <div className="flex items-start gap-4">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem className="w-28">
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-transparent focus:border-primary/30 focus:bg-background transition-all">
                                    <SelectValue placeholder="USD" />
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
                                <div className="relative">
                                  <Input
                                    type="number"
                                    className="h-12 px-4 rounded-xl bg-secondary/20 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                                    placeholder={t('salary.from')}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="h-px w-4 bg-muted-foreground/50 self-center mt-2" />
                        <FormField
                          control={form.control}
                          name="salary_max"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    className="h-12 px-4 rounded-xl bg-secondary/20 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                                    placeholder={t('salary.upTo')}
                                    {...field}
                                  />
                                </div>
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
                          <FormLabel className="text-base font-semibold text-foreground/80">{t('dialog.form.location')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="h-12 pl-10 rounded-xl bg-secondary/20 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                                placeholder={t('dialog.form.location_placeholder')}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <DialogFooter className="gap-3 sm:gap-0 pt-6 mt-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={isPending || isStepChanging}
                    className="rounded-xl h-12 px-6 hover:bg-secondary/50 text-muted-foreground"
                  >
                    {t('actions.back')}
                  </Button>
                )}
                <div className="flex-1" />
                <Button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={isPending || isStepChanging}
                  className="gap-2 rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  {currentStep < steps.length - 1 ? (
                    t('actions.next')
                  ) : (
                    <>
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {vacancyToEdit ? t('dialog.form.saving') : t('dialog.form.creating')}
                        </>
                      ) : (
                        <>
                          {vacancyToEdit ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {vacancyToEdit ? t('dialog.form.save') : t('dialog.form.submit')}
                        </>
                      )}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
