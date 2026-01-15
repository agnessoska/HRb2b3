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
import { HelpCircle } from '@/shared/ui/HelpCircle'
import { Loader2, Building2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { HrProfileSettings } from '@/features/hr-specialist/ui/HrProfileSettings'

import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  cultureDescription: z.string().optional(),
})

export default function HRProfilePage() {
  const { t } = useTranslation(['common', 'ai-assistant'])
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

  const { isDirty } = form.formState

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
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('fileTooLarge', 'File is too large (max 2MB)'))
        return
      }
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
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('profile')}</h1>
      </div>

      <HrProfileSettings />

      <Card className="overflow-hidden border-border/50 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
        <CardHeader className="p-8 border-b border-border/50 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  {t('organizationSettings')}
                </CardTitle>
                <HelpCircle topicId="organization_branding" iconClassName="opacity-50" />
              </div>
              <CardDescription className="text-base text-muted-foreground/80">
                {t('organizationSettingsDesc', 'Manage your organization profile and branding')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center gap-10 p-8 rounded-3xl bg-muted/10 border border-border/50 relative overflow-hidden group/logo">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                
                <div className="relative group mx-auto md:mx-0 z-10">
                  <Avatar className="h-40 w-40 border-8 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    <AvatarImage src={previewUrl || ''} className="object-cover" />
                    <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                      {organization?.name?.substring(0, 2).toUpperCase() || 'OR'}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="logo-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-background/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full backdrop-blur-[2px]"
                  >
                    <span className="text-xs font-medium">{t('change', 'Change')}</span>
                  </label>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-base font-semibold">{t('logo', 'Logo')}</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('logoHelp', 'Recommended size: 512x512px. Max file size: 2MB.')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="rounded-xl shadow-lg border-border/50 hover:bg-background transition-all"
                    >
                      {t('uploadAvatarBtn', 'Upload Photo')}
                    </Button>
                    {logoFile && (
                      <span className="text-sm font-medium text-primary bg-primary/5 px-3 py-1 rounded-full animate-in fade-in slide-in-from-left-2">
                        {logoFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {t('organizationName', 'Organization Name')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Acme Corp" 
                          className="h-14 text-lg font-medium rounded-2xl border-border/50 bg-background/50 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                          {...field}
                        />
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
                      <div className="flex items-center gap-2 mb-1">
                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground m-0">
                          {t('cultureCode', 'Cultural Code')}
                        </FormLabel>
                        <HelpCircle topicId="culture_code" />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder={t('cultureCodePlaceholder', 'Describe your company culture, values, and work environment...')}
                          className="resize-y min-h-[200px] text-base rounded-2xl border-border/50 bg-background/50 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all shadow-inner p-6"
                          {...field}
                        />
                      </FormControl>
                      <CardDescription className="text-xs mt-2">
                        {t('cultureCodeHelp', 'This information will be used by AI Assistant to provide better recommendations aligned with your company values.')}
                      </CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isPending || (!isDirty && !logoFile)} 
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
    </div>
  )
}
