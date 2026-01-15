import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Coins, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PricingSection() {
  const { t, i18n } = useTranslation('landing')
  const lang = i18n.language.substring(0, 2)
  const billingPic = `/pics/7${lang}.png`

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            {/* Content */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                  <Coins className="h-4 w-4" />
                  <span>{t('pricing.badge')}</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                  {t('pricing.title')}
                </h2>
                
                <p className="text-xl text-primary font-semibold mb-6">
                  {t('pricing.subtitle')}
                </p>
                
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {t('pricing.description')}
                </p>

                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">{t('pricing.features.welcomeTokens')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">{t('pricing.features.noFees')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">{t('pricing.features.noExpire')}</span>
                  </li>
                </ul>

                <Button size="lg" className="h-14 px-8 text-lg rounded-2xl group shadow-xl shadow-primary/20" asChild>
                  <Link to="/auth/login?mode=register">
                    {t('pricing.cta')}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Visual */}
            <motion.div 
              className="flex-1 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-violet-500/20 rounded-[2.5rem] blur-2xl opacity-50 transition-opacity duration-500" />
                <div className="relative rounded-[2rem] p-2 bg-gradient-to-b from-border/50 to-border/20 border shadow-2xl overflow-hidden bg-background">
                  <div className="rounded-[1.5rem] border overflow-hidden">
                    <img
                      src={billingPic}
                      alt="Billing Interface"
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
