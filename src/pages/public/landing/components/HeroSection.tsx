import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, BrainCircuit, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { t, i18n } = useTranslation('landing')
  const lang = i18n.language.substring(0, 2)
  const screenshot = `/pics/8${lang}.png`

  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute -right-[10%] bottom-0 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px] animate-pulse" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Sparkles className="h-4 w-4" />
                <span>{t('hero.badge')}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                {t('hero.title')}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Button size="lg" className="h-14 px-8 text-lg rounded-2xl group w-full sm:w-auto shadow-lg shadow-primary/20" asChild>
                  <Link to="/auth/login?mode=register">
                    {t('hero.ctaPrimary')}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl w-full sm:w-auto bg-background/50 backdrop-blur-sm" asChild>
                  <a href="#features">
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    {t('hero.ctaSecondary')}
                  </a>
                </Button>
              </div>

              {/* Floating Badges (Desktop) */}
              <div className="hidden sm:flex items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  {t('hero.badgeTests')}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  {t('hero.badgeAI')}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  {t('hero.badgeMatch')}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual */}
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative group">
              {/* Device Frame */}
              <div className="rounded-[2rem] p-2 bg-gradient-to-b from-border/50 to-border/20 border shadow-2xl overflow-hidden bg-background">
                <div className="rounded-[1.5rem] border overflow-hidden">
                  <img
                    src={screenshot}
                    alt="App Interface"
                    className="w-full h-auto object-cover"
                    loading="eager"
                  />
                </div>
              </div>
              
              {/* Decorative elements around image */}
              <div className="absolute -top-6 -right-6 h-24 w-24 bg-primary/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '4s' }} />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-violet-500/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
