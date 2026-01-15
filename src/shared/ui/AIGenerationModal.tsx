import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Sparkles, Loader2, CheckCircle, X } from 'lucide-react'
import { AIBorder } from './AIBorder'
import { cn } from '@/lib/utils'

interface AIGenerationModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  isError?: boolean
  error?: string
  title: string
  description?: string
  loadingSteps?: string[]
  progress?: number
  simulationMode?: 'default' | 'slow'
  finalTokens?: number
  itemsCount?: number
}

export const AIGenerationModal = ({
  isOpen,
  onOpenChange,
  isPending,
  isError,
  error,
  title,
  description,
  loadingSteps,
  progress: externalProgress,
  simulationMode = 'default',
  finalTokens,
  itemsCount
}: AIGenerationModalProps) => {
  const { t } = useTranslation('common')
  const [internalProgress, setInternalProgress] = useState(0)
  const [smoothProgress, setSmoothProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  // Default steps if none provided
  const steps = loadingSteps || [
    'aiModal.steps.initializing',
    'aiModal.steps.analyzing',
    'aiModal.steps.processing',
    'aiModal.steps.generating',
    'aiModal.steps.finalizing'
  ]

  // 1. Internal Progress Simulation (used only if externalProgress is NOT provided)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (isOpen && isPending && externalProgress === undefined) {
      const targetMax = 95
      const duration = simulationMode === 'slow' ? 250000 : 45000 
      const intervalTime = 500
      const incrementBase = (targetMax / (duration / intervalTime))

      interval = setInterval(() => {
        setInternalProgress(prev => {
          if (prev >= targetMax) return prev
          
          let increment = incrementBase
          if (prev > 50) increment = incrementBase * 0.5
          if (prev > 80) increment = incrementBase * 0.2

          return Math.min(targetMax, prev + increment)
        })
      }, intervalTime)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isOpen, isPending, externalProgress, simulationMode])

  // 2. Smooth Progress & Crawl logic
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSmoothProgress(0)
        setInternalProgress(0)
        setCurrentStep(0)
      }, 300)
      return () => clearTimeout(timer)
    }

    if (!isPending) {
      const timer = setTimeout(() => setSmoothProgress(100), 0)
      return () => clearTimeout(timer)
    }

    const target = externalProgress !== undefined ? externalProgress : internalProgress
    
    let timer: ReturnType<typeof setTimeout>

    if (smoothProgress < target) {
      // Speed up to catch up with target
      const diff = target - smoothProgress
      const step = Math.max(0.1, diff * 0.15) 
      timer = setTimeout(() => {
        setSmoothProgress(prev => Math.min(target, prev + step))
      }, 40)
    } else if (isPending && smoothProgress < 99) {
      // Crawl speed depends on items count
      let crawlStep = 0.03
      if (itemsCount) {
        if (itemsCount <= 10) crawlStep = 0.15
        else if (itemsCount <= 25) crawlStep = 0.06
        else crawlStep = 0.02
      } else if (simulationMode === 'slow') {
        crawlStep = 0.01
      }

      timer = setTimeout(() => {
        setSmoothProgress(prev => {
          if (prev >= 99) return prev
          return Math.min(99, prev + crawlStep)
        })
      }, 200)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isOpen, isPending, externalProgress, internalProgress, smoothProgress, simulationMode, itemsCount])

  // 3. Step Rotation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isOpen && isPending) {
      interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length)
      }, 3000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isOpen, isPending, steps.length])

  const handleOpenChange = (open: boolean) => {
    if (isPending && !open) return
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md overflow-hidden border-none bg-transparent shadow-none p-0"
        onPointerDownOutside={(e) => {
            if (isPending) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
            if (isPending) e.preventDefault()
        }}
      >
        <AIBorder className="p-[1px] rounded-xl bg-gradient-to-br from-primary/50 via-purple-500/50 to-blue-500/50 backdrop-blur-xl">
          <div className="bg-background/80 backdrop-blur-2xl p-6 rounded-xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <DialogHeader className="relative z-10">
              <div className="mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-background/50 p-4 rounded-full border border-primary/20 shadow-lg">
                    {isPending ? (
                        <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
                    ) : isError ? (
                        <X className="w-10 h-10 text-destructive" />
                    ) : (
                        <Sparkles className="w-10 h-10 text-primary" />
                    )}
                </div>
              </div>
              <DialogTitle className={cn(
                "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                isError ? "from-destructive to-red-600" : "from-primary to-purple-600"
              )}>
                {isError ? t('common:error') : title}
              </DialogTitle>
              {(description || error) && (
                <DialogDescription className={cn("text-muted-foreground", isError && "text-destructive/80")}>
                  {isError ? error : description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="w-full space-y-4 relative z-10">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        {t(steps[currentStep], { defaultValue: steps[currentStep] })}
                    </motion.span>
                </AnimatePresence>
                <span>{Math.round(smoothProgress)}%</span>
              </div>
              
              <Progress value={smoothProgress} className="h-2" indicatorClassName="bg-gradient-to-r from-primary to-purple-600" />
              
              {isOpen && !isPending && (finalTokens || isError) ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border",
                    isError
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-emerald-500/10 border-emerald-500/20"
                  )}
                >
                  {isError ? (
                    <>
                      <div className="flex items-center gap-2 text-destructive font-bold">
                        <X className="w-5 h-5" />
                        <span>{t('common:error')}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="mt-2 h-8 rounded-lg border-destructive/20 hover:bg-destructive/10 text-destructive"
                      >
                        {t('common:close')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        <span>{t('aiModal.completed', 'Генерация завершена!')}</span>
                      </div>
                      {finalTokens !== undefined && (
                        <div className="text-sm font-medium text-emerald-700/70 dark:text-emerald-300/70">
                          {t('payments:tokenUsage.actuallySpent', 'Фактически списано')}: {finalTokens.toLocaleString()} 🪙
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 py-2 px-3 rounded-full w-fit mx-auto">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{t('aiModal.doNotClose', 'Пожалуйста, не закрывайте окно')}</span>
                </div>
              )}
            </div>
          </div>
        </AIBorder>
      </DialogContent>
    </Dialog>
  )
}
