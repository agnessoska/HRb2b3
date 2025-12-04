import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useUpdateOrganization } from '@/features/organization/api/updateOrganization'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  cultureDescription: z.string().optional(),
})

export default function HRProfilePage() {
  const { t } = useTranslation('common')
  const { data: organization, isLoading } = useOrganization()
  const { mutate: updateOrganization, isPending } = useUpdateOrganization()
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      cultureDescription: '',
    },
  })

  React.useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        cultureDescription: organization.culture_description || '',
      })
      if (organization.brand_logo_url) {
        setPreviewUrl(organization.brand_logo_url)
      }
    }
  }, [organization, form])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!organization) return

    updateOrganization({
      id: organization.id,
      name: values.name,
      logoFile: logoFile || undefined,
      cultureDescription: values.cultureDescription,
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('profile')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('organizationSettings')}</CardTitle>
          <CardDescription>{t('organizationSettingsDesc', 'Manage your organization profile and branding')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || ''} />
                  <AvatarFallback>{organization?.name?.substring(0, 2).toUpperCase() || 'OR'}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>{t('logo', 'Logo')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full max-w-xs"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('logoHelp', 'Recommended size: 512x512px. Max file size: 2MB.')}
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('organizationName', 'Organization Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
              control={form.control}
              name="cultureDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('cultureCode', 'Cultural Code')}</FormLabel>
                   <FormControl>
                      <Textarea
                        placeholder={t('cultureCodePlaceholder', 'Describe your company culture, values, and work environment...')}
                        className="resize-y min-h-[150px]"
                        {...field}
                      />
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
  </div>
)
}