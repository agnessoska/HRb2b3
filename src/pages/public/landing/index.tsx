import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth'
import { PublicHeader } from '@/shared/ui/PublicHeader'
import { HeroSection } from './components/HeroSection'
import { TrustBar } from './components/TrustBar'
import { ProblemSolution } from './components/ProblemSolution'
import { FeaturesSection } from './components/FeaturesSection'
import { AIEverywhereSection } from './components/AIEverywhereSection'
import { PricingSection } from './components/PricingSection'
import { ScreenshotGallery } from './components/ScreenshotGallery'
import { FAQSection } from './components/FAQSection'
import { FinalCTA } from './components/FinalCTA'

export default function LandingPage() {
  const { t } = useTranslation(['landing', 'common'])
  const { session } = useAuthStore()

  // Redirect to dashboard if already logged in
  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />
        <TrustBar />
        <ProblemSolution />
        <FeaturesSection />
        <AIEverywhereSection />
        <PricingSection />
        <ScreenshotGallery />
        <FAQSection />
        <FinalCTA />
      </main>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <span className="text-2xl font-black italic tracking-tighter select-none">L</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight">{t('common:appName')}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing:footer.tagline')}
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">{t('landing:footer.links')}</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">{t('landing:footer.features')}</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">{t('landing:footer.pricing')}</a></li>
                <li><Link to="/auth/login" className="hover:text-primary transition-colors">{t('landing:hero.ctaLogin')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">{t('landing:footer.company')}</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">{t('landing:footer.about')}</Link></li>
                <li><a href="mailto:support@hr.labpro.in" className="hover:text-primary transition-colors">{t('landing:footer.support')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">{t('landing:footer.legal')}</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/public/privacy" className="hover:text-primary transition-colors">{t('landing:footer.privacy')}</Link></li>
                <li><Link to="/public/terms" className="hover:text-primary transition-colors">{t('landing:footer.terms')}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
            <p>{t('landing:footer.copyright')}</p>
            <div className="flex items-center gap-6">
              <p>support@hr.labpro.in</p>
              <span className="text-border">|</span>
              <p>v2.0.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
