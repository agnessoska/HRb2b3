import { useState } from 'react'
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
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useAuthStore } from '@/app/store/auth'
import { useTranslation } from 'react-i18next'

const vacancySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  location: z.string().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'remote']),
})

export function CreateVacancyDialog() {
  const { t } = useTranslation('vacancies')
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data: organization } = useOrganization()
  const { user } = useAuthStore()

  const form = useForm<z.infer<typeof vacancySchema>>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      employment_type: 'full-time',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createVacancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', organization?.id] })
      setIsOpen(false)
      form.reset()
    },
  })

  function onSubmit(values: z.infer<typeof vacancySchema>) {
    if (!organization || !user) return
    mutate({
      ...values,
      organization_id: organization.id,
      created_by_hr_id: user.id,
      status: 'active',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{t('create_new')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('dialog.create_title')}</DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
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
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                {t('dialog.form.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t('dialog.form.creating')
                  : t('dialog.form.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
