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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createVacancy } from '../api/createVacancy'
import { updateVacancy } from '../api/updateVacancy'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useTranslation } from 'react-i18next'
import { Plus, Loader2, Edit } from 'lucide-react'
import type { Database } from '@/shared/types/database'

type Vacancy = Database['public']['Tables']['vacancies']['Row']

const createVacancySchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t('validation.titleRequired')),
  description: z.string().min(1, t('validation.descriptionRequired')),
  requirements: z.string().min(1, t('validation.requirementsRequired')),
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
      employment_type: 'full-time',
    },
  })

  const [currentStep, setCurrentStep] = useState(0)
  const steps = ['Basic Info', 'Requirements', 'Details']

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await form.trigger(fieldsToValidate)
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const getFieldsForStep = (step: number): Array<keyof z.infer<typeof vacancySchema>> => {
    switch (step) {
      case 0: return ['title', 'description']
      case 1: return ['requirements']
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
        employment_type: (vacancyToEdit.employment_type as 'full-time' | 'part-time' | 'remote') || 'full-time',
        salary_min: vacancyToEdit.salary_min?.toString() || '',
        salary_max: vacancyToEdit.salary_max?.toString() || '',
        location: vacancyToEdit.location || '',
      })
    } else if (isOpen && !vacancyToEdit) {
      form.reset({
        title: '',
        description: '',
        requirements: '',
        employment_type: 'full-time',
        salary_min: '',
        salary_max: '',
        location: '',
      })
    }
  }, [isOpen, vacancyToEdit, form])


  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createVacancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', organization?.id] })
      setIsOpen(false)
      form.reset()
    },
  })

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateVacancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', organization?.id] })
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!controlledIsOpen && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('create_new')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">
            {vacancyToEdit ? t('dialog.edit_title') : t('dialog.create_title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {vacancyToEdit ? t('dialog.edit_description') : t('dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`text-xs font-medium ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dialog.form.title')}</FormLabel>
                        <FormControl>
                          <Input
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
                        <FormLabel>{t('dialog.form.description')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('dialog.form.description_placeholder')}
                            {...field}
                            rows={5}
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dialog.form.requirements')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('dialog.form.requirements_placeholder')}
                            {...field}
                            rows={8}
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dialog.form.employment_type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'dialog.form.employment_type_placeholder'
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">
                              {t('dialog.form.employment_types.full-time')}
                            </SelectItem>
                            <SelectItem value="part-time">
                              {t('dialog.form.employment_types.part-time')}
                            </SelectItem>
                            <SelectItem value="remote">
                              {t('dialog.form.employment_types.remote')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Add other fields if needed, e.g. salary, location */}
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="gap-2 sm:gap-0">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isPending} className="gap-2">
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
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
