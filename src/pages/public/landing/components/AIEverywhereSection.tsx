import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Sparkles, FileText, Brain, MessageSquare, ListTodo } from 'lucide-react'

export function AIEverywhereSection() {
  const { t } = useTranslation('landing')

  const items = [
    {
      key: 'resume',
      icon: <FileText className="h-6 w-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      key: 'assessment',
      icon: <Brain className="h-6 w-6" />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      key: 'interview',
      icon: <ListTodo className="h-6 w-6" />,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10'
    },
    {
      key: 'decision',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ]

  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
            <Sparkles className="h-4 w-4" />
            <span>{t('aiEverywhere.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('aiEverywhere.title')}</h2>
          <p className="text-xl text-muted-foreground">{t('aiEverywhere.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-[2rem] border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className={`h-12 w-12 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{t(`aiEverywhere.items.${item.key}.label`)}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(`aiEverywhere.items.${item.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
