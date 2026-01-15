import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  XCircle,
  CheckCircle2,
  Clock,
  FileText,
  Zap,
  Brain,
  Target,
  MessageSquare,
  ShieldAlert,
  Search,
  UserCheck
} from 'lucide-react'
 
export function ProblemSolution() {
  const { t } = useTranslation('landing')
 
  const oldWayIcons = [
    <Clock className="h-6 w-6" />,
    <Search className="h-6 w-6" />,
    <Zap className="h-6 w-6 opacity-50" />, // Low energy icon for intuition
    <MessageSquare className="h-6 w-6" />,
    <ShieldAlert className="h-6 w-6" />
  ]

  const newWayIcons = [
    <Zap className="h-6 w-6" />,
    <Brain className="h-6 w-6" />,
    <Target className="h-6 w-6" />,
    <UserCheck className="h-6 w-6" />,
    <FileText className="h-6 w-6" />
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('problem.title')}</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Old Way */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 px-4">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-muted-foreground">{t('problem.oldWay.title')}</h3>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((num, i) => (
                <motion.div 
                  key={num} 
                  variants={itemVariants} 
                  className="p-6 rounded-[2rem] bg-muted/10 border border-border/50 hover:bg-muted/20 transition-colors group"
                >
                  <div className="flex items-start gap-5">
                    <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground/30 group-hover:text-destructive/50 transition-colors shrink-0 mt-1">
                      {oldWayIcons[i]}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-muted-foreground mb-1 leading-tight">
                        {t(`problem.oldWay.item${num}`)}
                      </h4>
                      <p className="text-sm text-muted-foreground/70 leading-relaxed">
                        {t(`problem.oldWay.desc${num}`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
 
          {/* New Way */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{t('problem.newWay.title')}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase animate-pulse">
                AI Evolution
              </span>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((num, i) => (
                <motion.div 
                  key={num} 
                  variants={itemVariants} 
                  className="p-6 rounded-[2rem] bg-background border border-primary/10 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                      {newWayIcons[i]}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">
                        {t(`problem.newWay.item${num}`)}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(`problem.newWay.desc${num}`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Zap className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <p className="text-lg font-medium italic leading-relaxed mb-4">
                  «{t('problem.newWay.quote')}»
                </p>
                <div className="h-1 w-12 bg-primary-foreground/30 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
