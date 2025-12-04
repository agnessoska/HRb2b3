import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { SkillsMultiSelect } from '@/features/talent-market/ui/SkillsMultiSelect'
import { ProfessionalCategorySelect } from './ProfessionalCategorySelect'
import { updateCandidateProfile } from '../api/updateCandidateProfile'
import type { CandidateProfile } from '../api/getCandidateProfile'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string(),
  category_id: z.string(),
  experience: z.string(),
  education: z.string(),
  about: z.string(),
  is_public: z.boolean(),
  skills: z.array(z.string()),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface CandidateProfileFormProps {
  initialData: CandidateProfile
  onUpdate?: () => void
}

export function CandidateProfileForm({ initialData, onUpdate }: CandidateProfileFormProps) {
  const { t } = useTranslation(['candidates', 'common'])
  const [loading, setLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialData.full_name || '',
      phone: initialData.phone || '',
      category_id: initialData.category_id || '',
      experience: initialData.experience || '',
      education: initialData.education || '',
      about: initialData.about || '',
      is_public: initialData.is_public || false,
      skills: initialData.candidate_skills?.map(s => s.canonical_skill) || [],
    },
  })

  useEffect(() => {
    form.reset({
      full_name: initialData.full_name || '',
      phone: initialData.phone || '',
      category_id: initialData.category_id || '',
      experience: initialData.experience || '',
      education: initialData.education || '',
      about: initialData.about || '',
      is_public: initialData.is_public || false,
      skills: initialData.candidate_skills?.map(s => s.canonical_skill) || [],
    })
  }, [initialData, form])

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true)
    try {
      await updateCandidateProfile(initialData.id, {
        full_name: data.full_name,
        phone: data.phone || null,
        category_id: data.category_id || null,
        experience: data.experience || null,
        education: data.education || null,
        about: data.about || null,
        is_public: data.is_public,
        skills: data.skills,
      })
      toast.success(t('profile.updateSuccess', 'Профиль успешно обновлен'))
      onUpdate?.()
      form.reset(data)
    } catch (error) {
      console.error(error)
      toast.error(t('profile.updateError', 'Ошибка при обновлении профиля'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.fullName', 'ФИО')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.phone', 'Телефон')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.category', 'Категория')}</FormLabel>
              <ProfessionalCategorySelect
                value={field.value}
                onValueChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.skills', 'Навыки')}</FormLabel>
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

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.experience', 'Опыт работы')}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  className="min-h-[100px]"
                  placeholder={t('profile.experiencePlaceholder', 'Опишите ваш опыт работы...')} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.education', 'Образование')}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  className="min-h-[80px]"
                  placeholder={t('profile.educationPlaceholder', 'Укажите ваше образование...')} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.about', 'О себе')}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  className="min-h-[100px]"
                  placeholder={t('profile.aboutPlaceholder', 'Расскажите о себе...')} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-card/50">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-semibold cursor-pointer">
                  {t('profile.isPublic', 'Публичный профиль')}
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  {t('profile.isPublicDesc', 'Разрешить HR-специалистам видеть ваш профиль в поиске (Рынок талантов)')}
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !form.formState.isDirty} size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save', { ns: 'common' })}
          </Button>
        </div>
      </form>
    </Form>
  )
}
