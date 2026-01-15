import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Dynamic Background Decorations */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] opacity-50" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative group"
        >
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-[3rem] p-12 md:p-24 bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/5">
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {/* Floating Glows */}
            <motion.div 
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-12 h-24 w-24 rounded-full bg-primary/20 blur-2xl" 
            />
            <motion.div 
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 right-12 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" 
            />

            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground mb-10 shadow-2xl shadow-primary/40 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Sparkles className="h-10 w-10" />
              </div>

              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-[1.1]">
                {t('finalCta.title')}
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground/80 mb-14 max-w-2xl leading-relaxed">
                {t('finalCta.subtitle')}
              </p>

              <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
                <Button size="lg" className="h-20 px-12 text-2xl font-bold rounded-[2rem] group shadow-2xl shadow-primary/40 w-full hover:scale-[1.02] active:scale-[0.98] transition-all" asChild>
                  <Link to="/auth/login?mode=register">
                    {t('finalCta.button')}
                    <ArrowRight className="ml-3 h-8 w-8 transition-transform group-hover:translate-x-2" />
                  </Link>
                </Button>
                
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('finalCta.note')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
