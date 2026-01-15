import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { ModeToggle } from '@/shared/ui/ModeToggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface PublicHeaderProps {
  showAuthButtons?: boolean
}

export function PublicHeader({ showAuthButtons = true }: PublicHeaderProps) {
  const { t } = useTranslation(['common', 'landing'])
  const location = useLocation()
  const isAuthPage = location.pathname.startsWith('/auth/')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="text-2xl font-black italic tracking-tighter select-none">L</span>
          </div>
          <span className="text-xl font-bold tracking-tight">{t('common:appName')}</span>
        </Link>

        {/* Navigation & Controls */}
        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-6 mr-4">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {t('landing:footer.features')}
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {t('landing:footer.pricing')}
              </a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {t('landing:faq.title')}
              </a>
            </nav>
          )}
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
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-lg font-black italic tracking-tighter select-none">L</span>
                    </div>
                    <span>{t('common:appName')}</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {!isAuthPage && (
                    <>
                      <a href="#features" className="text-lg font-medium hover:text-primary transition-colors">
                        {t('landing:footer.features')}
                      </a>
                      <a href="#pricing" className="text-lg font-medium hover:text-primary transition-colors">
                        {t('landing:footer.pricing')}
                      </a>
                      <a href="#faq" className="text-lg font-medium hover:text-primary transition-colors">
                        {t('landing:faq.title')}
                      </a>
                      <hr className="my-2" />
                    </>
                  )}
                  {showAuthButtons && (
                    <>
                      <Button variant="outline" asChild className="w-full justify-start">
                        <Link to="/auth/login">{t('landing:hero.ctaLogin')}</Link>
                      </Button>
                      <Button asChild className="w-full justify-start">
                        <Link to="/auth/login?mode=register">{t('landing:hero.ctaStart')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
