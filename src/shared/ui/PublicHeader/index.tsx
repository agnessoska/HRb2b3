import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { ModeToggle } from '@/shared/ui/ModeToggle'

interface PublicHeaderProps {
  showAuthButtons?: boolean
}

export function PublicHeader({ showAuthButtons = true }: PublicHeaderProps) {
  const { t } = useTranslation(['common', 'landing'])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Briefcase className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('common:appName')}</span>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showAuthButtons && (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild size="sm">
                <Link to="/auth/login">{t('landing:hero.ctaLogin')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth/login?mode=register">{t('landing:hero.ctaStart')}</Link>
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
