import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Briefcase } from 'lucide-react'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { ModeToggle } from '@/shared/ui/ModeToggle'

export function AuthLayout() {
  const { t } = useTranslation('common')

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-4 bottom-1/4 h-96 w-96 rounded-full bg-chart-1/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center relative md:absolute top-0 left-0 right-0 p-4 md:p-8 z-20">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Briefcase className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('appName')}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4 md:p-8 mt-20">
        <Outlet />
      </div>
    </div>
  )
}
