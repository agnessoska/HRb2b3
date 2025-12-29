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
import { uploadAvatar } from '@/shared/api/uploadAvatar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/shared/hooks/useAuth'

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
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user) {
      const loadingToast = toast.loading(t('profile.uploadingAvatar', 'Загрузка аватара...'))
      try {
        setLoading(true)
        const avatarUrl = await uploadAvatar(file, user.id)
        
        await updateCandidateProfile(initialData.id, {
          ...form.getValues(),
          avatar_url: avatarUrl,
        })
        
        toast.success(t('profile.avatarUpdated', 'Аватар успешно обновлен'), { id: loadingToast })
        setPreviewUrl(avatarUrl)
        onUpdate?.()
      } catch (error) {
        console.error('Failed to update avatar:', error)
        toast.error(t('profile.avatarUpdateError', 'Ошибка при обновлении аватара'), { id: loadingToast })
      } finally {
        setLoading(false)
      }
    }
  }

  const avatarSrc = previewUrl || initialData.avatar_url || user?.user_metadata?.avatar_url || ''

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
        avatar_url: initialData.avatar_url,
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

  const isSaveDisabled = loading || !form.formState.isDirty

  // Экспортируем состояние формы вовне для верхней кнопки
  useEffect(() => {
    const event = new CustomEvent('profile-form-state', { 
      detail: { isDirty: form.formState.isDirty, loading } 
    });
    window.dispatchEvent(event);
  }, [form.formState.isDirty, loading]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="candidate-profile-form">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24 border-2 border-border/50">
            <AvatarImage src={avatarSrc} className="object-cover" />
            <AvatarFallback className="text-xl font-bold">{initialData.full_name?.substring(0, 2).toUpperCase() || 'CN'}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label>{t('profile.avatar', 'Avatar')}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                style={{ display: 'none' }}
                id="candidate-avatar-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('candidate-avatar-upload')?.click()}
                disabled={loading}
              >
                {t('uploadAvatarBtn', { ns: 'common', defaultValue: 'Upload Photo' })}
              </Button>
            </div>
          </div>
        </div>

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
          <Button type="submit" disabled={isSaveDisabled} size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('save', { ns: 'common' })}
          </Button>
        </div>
      </form>
    </Form>
  )
}
