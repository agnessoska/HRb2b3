import { useEffect } from 'react'
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
} from '@/components/ui/dialog'
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
import { useTranslation } from 'react-i18next'
import { Save, Loader2 } from 'lucide-react'
import type { Database } from '@/shared/types/database'
import { supabase } from '@/shared/lib/supabase'
import { toast } from 'sonner'

type Vacancy = Database['public']['Tables']['vacancies']['Row']

const vacancySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  location: z.string().optional().nullable(),
  employment_type: z.enum(['full-time', 'part-time', 'remote']).nullable(),
})

interface EditVacancyDialogProps {
  vacancy: Vacancy
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVacancyDialog({ vacancy, open, onOpenChange }: EditVacancyDialogProps) {
  const { t } = useTranslation('vacancies')
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof vacancySchema>>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: vacancy.title,
      description: vacancy.description || '',
      requirements: vacancy.requirements || '',
      salary_min: vacancy.salary_min,
      salary_max: vacancy.salary_max,
      location: vacancy.location,
      employment_type: vacancy.employment_type as 'full-time' | 'part-time' | 'remote' | null,
    },
  })

  useEffect(() => {
    if (open && vacancy) {
      form.reset({
        title: vacancy.title,
        description: vacancy.description || '',
        requirements: vacancy.requirements || '',
        salary_min: vacancy.salary_min,
        salary_max: vacancy.salary_max,
        location: vacancy.location,
        employment_type: vacancy.employment_type as 'full-time' | 'part-time' | 'remote' | null,
      })
    }
  }, [open, vacancy, form])

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof vacancySchema>) => {
      const { error } = await supabase
        .from('vacancies')
        .update({
          title: values.title,
          description: values.description,
          requirements: values.requirements,
          salary_min: values.salary_min,
          salary_max: values.salary_max,
          location: values.location,
          employment_type: values.employment_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vacancy.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', vacancy.organization_id] })
      toast.success(t('card.updated_successfully'))
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(t('error'), { description: error.message })
    },
  })

  function onSubmit(values: z.infer<typeof vacancySchema>) {
    mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">{t('dialog.edit_title')}</DialogTitle>
          <DialogDescription className="text-base">
            {t('dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('dialog.form.salary_min')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('dialog.form.salary_max')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dialog.form.employment_type')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
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
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t('dialog.form.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('dialog.form.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t('dialog.form.save')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
