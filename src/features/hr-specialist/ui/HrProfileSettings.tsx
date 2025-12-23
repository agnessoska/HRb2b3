import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useUpdateHrProfile } from '../api/updateHrProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

export function HrProfileSettings() {
  const { t } = useTranslation('common')
  const { data: hrProfile } = useHrProfile()
  const { user } = useAuth()
  const { mutate: updateHrProfile, isPending } = useUpdateHrProfile()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
    },
  })

  useEffect(() => {
    if (hrProfile) {
      form.reset({
        full_name: hrProfile.full_name || '',
      })
    }
  }, [hrProfile, form])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const avatarSrc = previewUrl || hrProfile?.avatar_url || user?.user_metadata?.avatar_url || ''

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!hrProfile || !user) return

    updateHrProfile({
      id: hrProfile.id,
      full_name: values.full_name,
      avatarFile: avatarFile || undefined,
      userId: user.id
    })
  }

  if (!hrProfile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('personalSettings', 'Personal Profile')}</CardTitle>
        <CardDescription>{t('personalSettingsDesc', 'Manage your personal information')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>{hrProfile.full_name?.substring(0, 2).toUpperCase() || 'HR'}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label>{t('avatar', 'Avatar')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    style={{ display: 'none' }}
                    id="hr-avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('hr-avatar-upload')?.click()}
                  >
                    {t('uploadAvatarBtn', 'Upload Photo')}
                  </Button>
                  {avatarFile && <span className="text-sm text-muted-foreground truncate max-w-[150px]">{avatarFile.name}</span>}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fullName', 'Full Name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveChanges', 'Save Changes')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}