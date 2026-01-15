import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Brain,
  Target,
  Zap,
  Activity,
  UserSearch,
  Layers
} from 'lucide-react'

export function TrustBar() {
  const { t } = useTranslation('landing')

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: t('trustBar.feature1.title'),
      desc: t('trustBar.feature1.desc'),
      color: "text-blue-500",
      glow: "group-hover:shadow-blue-500/20"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: t('trustBar.feature2.title'),
      desc: t('trustBar.feature2.desc'),
      color: "text-purple-500",
      glow: "group-hover:shadow-purple-500/20"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: t('trustBar.feature3.title'),
      desc: t('trustBar.feature3.desc'),
      color: "text-emerald-500",
      glow: "group-hover:shadow-emerald-500/20"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: t('trustBar.feature4.title'),
      desc: t('trustBar.feature4.desc'),
      color: "text-orange-500",
      glow: "group-hover:shadow-orange-500/20"
    }
  ]

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Background Glow */}
              <div className={`absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-transparent to-transparent transition-all duration-500 blur-xl opacity-0 group-hover:opacity-100 ${feature.glow}`} />
              
              <div className="relative z-10">
                <div className={`h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center mb-8 mx-auto transition-all duration-500 group-hover:scale-110 group-hover:bg-background group-hover:shadow-xl ${feature.color}`}>
                  {feature.icon}
                </div>
                
                <h4 className="text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base px-4">
                  {feature.desc}
                </p>
              </div>

              {/* Decorative line */}
              {index < features.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 w-8 h-[1px] bg-border/50" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Interactive AI Core Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32 pt-16 border-t border-border/50 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-12">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-bold tracking-wide text-primary uppercase">{t('trustBar.aiCore.title')}</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center">
              {/* Neural Analysis */}
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center gap-4 group cursor-default"
              >
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-[2rem] bg-muted/30 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:bg-background group-hover:shadow-2xl border border-transparent group-hover:border-blue-500/20 text-muted-foreground group-hover:text-blue-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Activity className="h-8 w-8 md:h-10 md:w-10 transition-colors" />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/60 group-hover:text-primary transition-colors">{t('trustBar.aiCore.pillar1')}</span>
              </motion.div>

              {/* Psychometrics */}
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center gap-4 group cursor-default"
              >
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-[2rem] bg-muted/30 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:bg-background group-hover:shadow-2xl border border-transparent group-hover:border-purple-500/20 text-muted-foreground group-hover:text-purple-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UserSearch className="h-8 w-8 md:h-10 md:w-10 transition-colors" />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/60 group-hover:text-primary transition-colors">{t('trustBar.aiCore.pillar2')}</span>
              </motion.div>

              {/* Data Synthesis */}
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center gap-4 group cursor-default"
              >
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-[2rem] bg-muted/30 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:bg-background group-hover:shadow-2xl border border-transparent group-hover:border-emerald-500/20 text-muted-foreground group-hover:text-emerald-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Layers className="h-8 w-8 md:h-10 md:w-10 transition-colors" />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/60 group-hover:text-primary transition-colors">{t('trustBar.aiCore.pillar3')}</span>
              </motion.div>
            </div>
            
            <p className="mt-16 text-sm md:text-base font-medium text-muted-foreground max-w-2xl text-center leading-relaxed italic">
              "{t('trustBar.confidenceStatement')}"
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
