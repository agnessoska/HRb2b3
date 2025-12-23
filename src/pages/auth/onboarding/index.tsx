import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Briefcase, UserCircle2, Loader2, Building2 } from 'lucide-react'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/app/store/auth'
import { toast } from 'sonner'
import { useValidateInvitation } from '@/features/auth/api/validateInvitation'

const createOnboardingSchema = (t: (key: string) => string, isJoinMode: boolean) => z.object({
  role: z.enum(['hr', 'candidate']),
  organizationName: z.string().optional(),
}).refine((data) => {
  if (!isJoinMode && data.role === 'hr' && (!data.organizationName || data.organizationName.length < 2)) {
    return false
  }
  return true
}, {
  message: t('validation.organizationRequired'),
  path: ['organizationName'],
})

export default function OnboardingPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [invitationToken, setInvitationToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('invitation_token')
    if (token) {
      setInvitationToken(token)
    }
  }, [])

  const { data: invitationData, isLoading: isInvitationLoading } = useValidateInvitation(invitationToken)
  const isJoinMode = !!invitationData?.valid

  const onboardingSchema = createOnboardingSchema(t, isJoinMode)
  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: 'hr',
      organizationName: '',
    },
  })

  // Update form values when invitation data loads
  useEffect(() => {
    if (invitationData && invitationData.valid) {
      const role = invitationData.type === 'candidate' ? 'candidate' : 'hr'
      form.setValue('role', role)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationData])

  const role = form.watch('role')

  if (isInvitationLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  async function onSubmit(values: z.infer<typeof onboardingSchema>) {
    if (!user) return

    setLoading(true)
    try {
      // Get invitation token from local storage if exists
      const invitationToken = localStorage.getItem('invitation_token')

      const { error } = await supabase.rpc('complete_user_profile', {
        p_role: values.role,
        p_organization_name: values.role === 'hr' ? (values.organizationName || undefined) : undefined,
        p_invitation_token: invitationToken || undefined
      })

      if (error) throw error

      // Clear token
      if (invitationToken) {
        localStorage.removeItem('invitation_token')
      }

      // Refresh session to get updated metadata (role)
      const { data: { session } } = await supabase.auth.refreshSession()
      if (session) {
        setUser(session.user)
      }

      toast.success(t('onboardingSuccess'))
      
      if (values.role === 'hr') {
        navigate('/hr/dashboard')
      } else {
        navigate('/candidate/dashboard')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      const message = error instanceof Error ? error.message : t('onboardingError')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('completeProfileTitle')}</CardTitle>
          <CardDescription>{t('completeProfileDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('iAm')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                        disabled={isJoinMode}
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="hr" id="role-hr" className="peer sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="role-hr"
                            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
                          >
                            <Briefcase className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">{t('hrSpecialist')}</span>
                          </Label>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="candidate" id="role-candidate" className="peer sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="role-candidate"
                            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
                          >
                            <UserCircle2 className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">{t('candidate')}</span>
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === 'hr' && !isJoinMode && (
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('organizationLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t('organizationPlaceholder')} className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isJoinMode && (
                <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                  {invitationData?.type === 'candidate' ? (
                    <p>{t('joinAsCandidateDesc', { company: invitationData.organization_name })}</p>
                  ) : (
                    <p>{t('joinTeamDescription', { company: invitationData.organization_name })}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  t('completeProfileButton')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}