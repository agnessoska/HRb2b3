import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation, Trans } from 'react-i18next'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/shared/lib/supabase'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { ControllerRenderProps } from 'react-hook-form'
import { Mail, Lock, User, Building2, Loader2, Briefcase, UserCircle2 } from 'lucide-react'
import { useValidateInvitation } from '../api/validateInvitation'
import { toast } from 'sonner'

const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t('validation.invalidEmail') }),
  password: z.string().min(6, { message: t('validation.passwordMin') }),
})

const createRegisterSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t('validation.invalidEmail') }),
  password: z.string().min(6, { message: t('validation.passwordMin') }),
  fullName: z.string().min(2, { message: t('validation.fullNameRequired') }),
  organizationName: z.string().optional(),
})

const createForgotPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t('validation.invalidEmail') }),
})

type Role = 'hr' | 'candidate'

export function AuthForm() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('token')

  const [role, setRole] = useState<Role>('hr')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetLinkSent, setResetLinkSent] = useState(false)
  const [activeTab, setActiveTab] = useState(invitationToken ? 'register' : 'login')

  useEffect(() => {
    if (invitationToken) {
      setActiveTab('register')
    }
  }, [invitationToken])

  const { data: invitationData, isLoading: isInvitationLoading } = useValidateInvitation(invitationToken)

  const loginSchema = createLoginSchema(t)
  const registerSchema = createRegisterSchema(t)
  const forgotPasswordSchema = createForgotPasswordSchema(t)

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', fullName: '', organizationName: '' },
  })

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    if (invitationData && invitationData.valid) {
      if (invitationData.email && registerForm.getValues('email') !== invitationData.email) {
        registerForm.setValue('email', invitationData.email)
      }
      const newRole = invitationData.type || (invitationData.invited_by_hr_id ? 'candidate' : 'hr')
      setRole(newRole)
    } else if (invitationData && !invitationData.valid) {
        toast.error(t('validation.invalidToken'))
    }
  }, [invitationData, t, registerForm])


  async function onForgotPassword(values: z.infer<typeof forgotPasswordSchema>) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setResetLinkSent(true)
    }
    setLoading(false)
  }

  async function onLogin(values: z.infer<typeof loginSchema>) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    try {
      if (invitationToken) {
        localStorage.setItem('invitation_token', invitationToken)
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Google login error:', error)
      toast.error(t('googleLoginError'))
    } finally {
      setLoading(false)
    }
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    setLoading(true)
    setError(null)

    const isJoinMode = invitationData?.valid
    
    if (role === 'hr' && !isJoinMode && (!values.organizationName || values.organizationName.trim().length < 2)) {
      registerForm.setError('organizationName', {
        type: 'manual',
        message: t('validation.organizationRequired'),
      })
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: role,
          organization_name: role === 'hr' && !isJoinMode ? values.organizationName : undefined,
          invitation_token: isJoinMode ? invitationToken : undefined,
          invited_by_hr_id: invitationData?.invited_by_hr_id,
          invited_by_organization_id: invitationData?.invited_by_organization_id,
        },
      },
    })
    if (error) {
      setError(error.message)
    } else if (data.user) {
      if (data.user.identities?.length === 0) {
        setError(t('validation.emailTaken'))
      } else if (!data.session) {
        setShowEmailConfirmation(true)
      } else {
        navigate('/')
      }
    }
    setLoading(false)
  }

  if (isInvitationLoading) {
      return (
          <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  if (showEmailConfirmation) {
    return (
      <Card className="border-0 shadow-lg max-w-md w-full mx-auto">
        <CardHeader className="space-y-1 pb-6 text-center">
          <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">{t('checkEmailTitle')}</CardTitle>
          <CardDescription>{t('checkEmailDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            {t('checkEmailInstructions')}
          </p>
          <Button variant="outline" onClick={() => setShowEmailConfirmation(false)} className="w-full">
            {t('backToLogin')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showForgotPassword) {
    return (
      <Card className="border-0 shadow-lg max-w-md w-full mx-auto">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">{t('resetPasswordTitle')}</CardTitle>
          <CardDescription className="text-center">
            {resetLinkSent ? t('resetLinkSent') : t('resetPasswordDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetLinkSent ? (
             <Button variant="outline" onClick={() => {
               setShowForgotPassword(false)
               setResetLinkSent(false)
             }} className="w-full">
              {t('backToLogin')}
            </Button>
          ) : (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }: { field: ControllerRenderProps<z.infer<typeof forgotPasswordSchema>, "email"> }) => (
                    <FormItem>
                      <FormLabel>{t('emailLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t('emailPlaceholder')} className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('sendingResetLink')}
                    </>
                  ) : (
                    t('sendResetLink')
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForgotPassword(false)} className="w-full">
                  {t('backToLogin')}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    )
  }

  const isJoinMode = invitationData?.valid;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 px-4 sm:px-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">{t('loginTab')}</TabsTrigger>
          <TabsTrigger value="register">{t('registerTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
              <CardDescription>{t('loginDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }: { field: ControllerRenderProps<z.infer<typeof loginSchema>, "email"> }) => (
                      <FormItem>
                        <FormLabel>{t('emailLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder={t('emailPlaceholder')} 
                              className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }: { field: ControllerRenderProps<z.infer<typeof loginSchema>, "password"> }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t('passwordLabel')}</FormLabel>
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 font-normal text-xs text-muted-foreground hover:text-primary h-auto"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            {t('forgotPassword')}
                          </Button>
                        </div>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              type="password" 
                              className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full h-11 font-medium text-base shadow-sm hover:shadow-md transition-all duration-200" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('signingInButton')}
                      </>
                    ) : (
                      t('signInButton')
                    )}
                  </Button>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground font-medium">
                        {t('orContinueWith')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium hover:bg-accent/50 transition-colors"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                    )}
                    {t('signInWithGoogle')}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <Trans
                    t={t}
                    i18nKey="termsAgreement"
                    components={{
                      1: <Link key="terms" to="/public/terms" className="underline hover:text-primary transition-colors font-medium" />,
                      3: <Link key="privacy" to="/public/privacy" className="underline hover:text-primary transition-colors font-medium" />
                    }}
                  />
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="space-y-1 pb-6 flex flex-col items-center text-center">
              {isJoinMode && invitationData.brand_logo_url && (
                <div className="mb-4 h-16 w-16 rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center border border-border/50 shadow-sm">
                  <img
                    src={invitationData.brand_logo_url}
                    alt={invitationData.organization_name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardTitle className="text-2xl font-bold">
                  {isJoinMode
                    ? (invitationData.type === 'candidate'
                        ? t('joinAsCandidateTitle', { company: invitationData.organization_name, defaultValue: `Приглашение от ${invitationData.organization_name}` })
                        : t('joinTeamTitle', 'Присоединиться к команде'))
                    : t('registerTitle')}
              </CardTitle>
              <CardDescription>
                  {isJoinMode
                      ? (invitationData.type === 'candidate'
                          ? t('joinAsCandidateDesc', { company: invitationData.organization_name })
                          : t('joinTeamDescription', { company: invitationData.organization_name, defaultValue: `Вы присоединяетесь к ${invitationData.organization_name}` }))
                      : t('registerDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  {!isJoinMode && (
                      <div className="space-y-3">
                      <Label className="text-sm font-medium">{t('iAm')}</Label>
                      <RadioGroup
                        defaultValue={role}
                        value={role}
                        onValueChange={(value: Role) => setRole(value)}
                        className="grid grid-cols-2 gap-3"
                      >
                          <div>
                          <RadioGroupItem value="hr" id="r1" className="peer sr-only" />
                          <Label
                              htmlFor="r1"
                              className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
                          >
                              <Briefcase className="mb-2 h-6 w-6 peer-data-[state=checked]:text-primary" />
                              <span className="text-sm font-medium">{t('hrSpecialist')}</span>
                          </Label>
                          </div>
                          <div>
                          <RadioGroupItem value="candidate" id="r2" className="peer sr-only" />
                          <Label
                              htmlFor="r2"
                              className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
                          >
                              <UserCircle2 className="mb-2 h-6 w-6 peer-data-[state=checked]:text-primary" />
                              <span className="text-sm font-medium">{t('candidate')}</span>
                          </Label>
                          </div>
                      </RadioGroup>
                      </div>
                  )}
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }: { field: ControllerRenderProps<z.infer<typeof registerSchema>, "fullName"> }) => (
                      <FormItem>
                        <FormLabel>{t('fullNameLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder={t('fullNamePlaceholder')} 
                              className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }: { field: ControllerRenderProps<z.infer<typeof registerSchema>, "email"> }) => (
                      <FormItem>
                        <FormLabel>{t('emailLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder={t('emailPlaceholder')}
                              className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200"
                              {...field}
                              disabled={!!isJoinMode && !!invitationData?.email} // Disable only if email is pre-filled from token
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }: { field: ControllerRenderProps<z.infer<typeof registerSchema>, "password"> }) => (
                      <FormItem>
                        <FormLabel>{t('passwordLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              type="password" 
                              className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {role === 'hr' && !isJoinMode && (
                    <FormField
                      control={registerForm.control}
                      name="organizationName"
                      render={({ field }: { field: ControllerRenderProps<z.infer<typeof registerSchema>, "organizationName"> }) => (
                        <FormItem>
                          <FormLabel>{t('organizationLabel')}</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input 
                                placeholder={t('organizationPlaceholder')} 
                                className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full h-11 font-medium text-base shadow-sm hover:shadow-md transition-all duration-200" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('creatingAccountButton')}
                      </>
                    ) : (
                      t('createAccountButton')
                    )}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground font-medium">
                        {t('orContinueWith')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium hover:bg-accent/50 transition-colors"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                    )}
                    {t('signInWithGoogle')}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <Trans
                    t={t}
                    i18nKey="termsAgreement"
                    components={{
                      1: <Link key="terms" to="/public/terms" className="underline hover:text-primary transition-colors font-medium" />,
                      3: <Link key="privacy" to="/public/privacy" className="underline hover:text-primary transition-colors font-medium" />
                    }}
                  />
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
