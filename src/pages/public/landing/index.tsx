import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { FileSearch, Users, Sparkles, ArrowRight, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/app/store/auth'
import { PublicHeader } from '@/shared/ui/PublicHeader'

export default function LandingPage() {
  const { t } = useTranslation(['landing', 'common'])
  const { session } = useAuthStore()

  // Redirect to dashboard if already logged in
  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  const features = [
    {
      icon: <FileSearch className="h-10 w-10 text-primary" />,
      title: t('landing:features.aiAnalysis.title'),
      description: t('landing:features.aiAnalysis.description'),
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: t('landing:features.psychometry.title'),
      description: t('landing:features.psychometry.description'),
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: t('landing:features.smartFunnel.title'),
      description: t('landing:features.smartFunnel.description'),
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                {t('landing:hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('landing:hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl group" asChild>
                  <Link to="/auth/login?mode=register">
                    {t('landing:hero.ctaStart')}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl" asChild>
                  <Link to="/auth/login">{t('landing:hero.ctaLogin')}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">{t('landing:features.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="mb-6 p-4 rounded-2xl bg-primary/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">{t('common:appName')}</span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                {t('landing:footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t('landing:footer.links')}</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/auth/login" className="hover:text-primary transition-colors">{t('landing:hero.ctaLogin')}</Link></li>
                <li><Link to="/auth/login?mode=register" className="hover:text-primary transition-colors">{t('landing:hero.ctaStart')}</Link></li>
                <li><a href="mailto:support@hr.labpro.in" className="hover:text-primary transition-colors">{t('landing:footer.support')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t('landing:footer.legal')}</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link to="/public/privacy" className="hover:text-primary transition-colors">{t('landing:footer.privacy')}</Link></li>
                <li><Link to="/public/terms" className="hover:text-primary transition-colors">{t('landing:footer.terms')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>{t('landing:footer.copyright')}</p>
            <p>support@hr.labpro.in</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
