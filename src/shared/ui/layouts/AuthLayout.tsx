import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Briefcase } from 'lucide-react'

export function AuthLayout() {
  const { t } = useTranslation('common')

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-4 bottom-1/4 h-96 w-96 rounded-full bg-chart-1/5 blur-3xl" />
      </div>

      {/* Logo/Brand */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
          <Briefcase className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">{t('appName')}</span>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <Outlet />
      </div>
    </div>
  )
}
