import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function ScreenshotGallery() {
  const { t, i18n } = useTranslation('landing')
  const lang = i18n.language.substring(0, 2)

  const screens = [
    { key: 'dashboard', id: 2, label: t('footer.features') },
    { key: 'assistant', id: 5, label: t('features.aiAssistant.title') },
    { key: 'funnel', id: 8, label: t('features.smartFunnel.title') },
    { key: 'mobile', id: 4, label: t('gallery.mobileView') }
  ]

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('gallery.title')}</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="2" className="w-full">
            <div className="flex justify-center mb-12 overflow-x-auto pb-4 px-2">
              <TabsList className="bg-muted/50 p-1 h-auto rounded-2xl flex-wrap justify-center sm:flex-nowrap">
                {screens.map((screen) => (
                  <TabsTrigger 
                    key={screen.id} 
                    value={screen.id.toString()}
                    className="px-6 py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-base"
                  >
                    {screen.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {screens.map((screen) => (
              <TabsContent key={screen.id} value={screen.id.toString()}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-[2.5rem] blur opacity-25 transition duration-1000" />
                  <div className={cn(
                    "relative mx-auto bg-background shadow-2xl overflow-hidden",
                    screen.id === 4
                      ? "max-w-[280px] rounded-[3rem] border-[8px] border-zinc-900/10 dark:border-white/10"
                      : "rounded-[2rem] p-2 bg-gradient-to-b from-border/50 to-border/20 border"
                  )}>
                    <div className={cn(
                      "overflow-hidden",
                      screen.id === 4 ? "rounded-[2.5rem]" : "rounded-[1.5rem] border"
                    )}>
                      <img
                        src={`/pics/${screen.id}${lang}.png`}
                        alt={screen.label}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  )
}
