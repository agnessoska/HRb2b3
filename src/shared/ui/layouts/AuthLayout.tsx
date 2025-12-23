import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PublicHeader } from '../PublicHeader'

export function AuthLayout() {
  const { t } = useTranslation(['common', 'landing'])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-4 bottom-1/4 h-96 w-96 rounded-full bg-chart-1/5 blur-3xl" />
      </div>

      {/* Header */}
      <PublicHeader showAuthButtons={false} />

      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 w-full border-t bg-background/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            {t('landing:footer.copyright')}
          </p>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-6">
            <Link to="/public/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('landing:footer.privacy')}
            </Link>
            <Link to="/public/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('landing:footer.terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
