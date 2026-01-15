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

  const { isDirty } = form.formState

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
    <Card className="overflow-hidden border-none shadow-lg bg-card/60 backdrop-blur-md">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-xl font-semibold leading-none">
          {t('personalSettings', 'Personal Profile')}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {t('personalSettingsDesc', 'Manage your personal information')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-8 p-4 rounded-2xl bg-muted/20 border border-border/50">
              <div className="relative group mx-auto md:mx-0">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={avatarSrc} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {hrProfile.full_name?.substring(0, 2).toUpperCase() || 'HR'}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="hr-avatar-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-background/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full backdrop-blur-[2px]"
                >
                  <span className="text-xs font-medium">{t('change', 'Change')}</span>
                </label>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-base font-semibold">{t('avatar', 'Avatar')}</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('avatarHelp', 'Click on the avatar or button below to upload a new photo.')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="hr-avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('hr-avatar-upload')?.click()}
                    className="rounded-xl shadow-sm"
                  >
                    {t('uploadAvatarBtn', 'Upload Photo')}
                  </Button>
                  {avatarFile && (
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full animate-in fade-in slide-in-from-left-2 border border-primary/20">
                      {avatarFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {t('fullName', 'Full Name')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary transition-all shadow-sm" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 border-t">
              <Button 
                type="submit" 
                size="lg"
                disabled={isPending || (!isDirty && !avatarFile)}
                className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-4 animate-spin" />
                    {t('saving', 'Saving...')}
                  </>
                ) : (
                  t('saveChanges', 'Save Changes')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
