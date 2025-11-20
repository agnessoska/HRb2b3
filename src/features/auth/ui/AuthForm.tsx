import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/shared/lib/supabase'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { ControllerRenderProps } from 'react-hook-form'
import { Mail, Lock, User, Building2, Loader2, Briefcase, UserCircle2 } from 'lucide-react'

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
  const [role, setRole] = useState<Role>('hr')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetLinkSent, setResetLinkSent] = useState(false)

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

  async function onRegister(values: z.infer<typeof registerSchema>) {
    setLoading(true)
    setError(null)

    if (role === 'hr' && (!values.organizationName || values.organizationName.trim().length < 2)) {
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
          organization_name: role === 'hr' ? values.organizationName : undefined,
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

  if (showEmailConfirmation) {
    return (
      <Card className="border-0 shadow-lg">
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
      <Card className="border-0 shadow-lg">
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

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="login">{t('loginTab')}</TabsTrigger>
        <TabsTrigger value="register">{t('registerTab')}</TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="mt-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
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
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t('emailPlaceholder')} className="pl-10" {...field} />
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
                      <FormLabel>{t('passwordLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" className="pl-10" {...field} />
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
                      {t('signingInButton')}
                    </>
                  ) : (
                    t('signInButton')
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground hover:text-primary"
                  onClick={() => setShowForgotPassword(true)}
                >
                  {t('forgotPassword')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="register" className="mt-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
            <CardDescription>{t('registerDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t('iAm')}</Label>
                  <RadioGroup defaultValue="hr" onValueChange={(value: Role) => setRole(value)} className="grid grid-cols-2 gap-3">
                    <div>
                      <RadioGroupItem value="hr" id="r1" className="peer sr-only" />
                      <Label
                        htmlFor="r1"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <Briefcase className="mb-2 h-6 w-6" />
                        <span className="text-sm font-medium">{t('hrSpecialist')}</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="candidate" id="r2" className="peer sr-only" />
                      <Label
                        htmlFor="r2"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <UserCircle2 className="mb-2 h-6 w-6" />
                        <span className="text-sm font-medium">{t('candidate')}</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }: { field: ControllerRenderProps<z.infer<typeof registerSchema>, "fullName"> }) => (
                    <FormItem>
                      <FormLabel>{t('fullNameLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t('fullNamePlaceholder')} className="pl-10" {...field} />
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
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t('emailPlaceholder')} className="pl-10" {...field} />
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
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {role === 'hr' && (
                  <FormField
                    control={registerForm.control}
                    name="organizationName"
                    render={({ field }: { field: ControllerRenderProps<z.infer<typeof registerSchema>, "organizationName"> }) => (
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
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('creatingAccountButton')}
                    </>
                  ) : (
                    t('createAccountButton')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
