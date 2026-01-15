import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileSearch, Users, BrainCircuit, MessageSquareText, ShieldCheck, Target, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PsychometryVisual } from './PsychometryVisual'
 
interface FeatureItemProps {
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  customVisual?: React.ReactNode
  reversed?: boolean
  index: number
}
 
function FeatureItem({ title, description, icon, image, customVisual, reversed }: FeatureItemProps) {
  return (
    <div className={cn(
      "flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-24 last:mb-0",
      reversed && "lg:flex-row-reverse"
    )}>
      {/* Content */}
      <motion.div 
        className="flex-1 text-center lg:text-left"
        initial={{ opacity: 0, x: reversed ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-sm">
          {icon}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">{title}</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Visual */}
      <motion.div 
        className="flex-1 w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="relative group">
          {customVisual ? (
            <div className="relative rounded-[2rem] overflow-hidden">
              {customVisual}
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] -rotate-2 transition-transform duration-500" />
              <div className="relative rounded-[2rem] p-2 bg-gradient-to-b from-border/50 to-border/20 border shadow-2xl overflow-hidden bg-background">
                <div className="rounded-[1.5rem] border overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export function FeaturesSection() {
  const { t, i18n } = useTranslation('landing')
  const lang = i18n.language.substring(0, 2)

  const items = [
    {
      key: 'resumeAnalysis',
      icon: <FileSearch className="h-7 w-7" />,
      image: `/pics/1${lang}.png`
    },
    {
      key: 'resumeRanking',
      icon: <BarChart3 className="h-7 w-7" />,
      image: `/pics/9${lang}.png`
    },
    {
      key: 'psychometry',
      icon: <BrainCircuit className="h-7 w-7" />,
      customVisual: <PsychometryVisual />
    },
    {
      key: 'smartFunnel',
      icon: <Target className="h-7 w-7" />,
      image: `/pics/8${lang}.png`
    },
    {
      key: 'aiAssistant',
      icon: <MessageSquareText className="h-7 w-7" />,
      image: `/pics/5${lang}.png`
    },
    {
      key: 'talentMarket',
      icon: <Users className="h-7 w-7" />,
      image: `/pics/11${lang}.png`
    },
    {
      key: 'team',
      icon: <ShieldCheck className="h-7 w-7" />,
      image: `/pics/6${lang}.png`
    }
  ]

  return (
    <section id="features" className="py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            {t('features.title')}
          </h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto">
          {items.map((item, index) => (
            <FeatureItem
              key={item.key}
              index={index}
              title={t(`features.${item.key}.title`)}
              description={t(`features.${item.key}.desc`)}
              icon={item.icon}
              image={item.image}
              customVisual={item.customVisual}
              reversed={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
