import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { BrainCircuit, Sparkles, Loader2 } from 'lucide-react'
import { AIBorder } from './AIBorder'

interface AIGenerationModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  title: string
  description?: string
  loadingSteps?: string[]
}

export const AIGenerationModal = ({
  isOpen,
  onOpenChange,
  isPending,
  title,
  description,
  loadingSteps
}: AIGenerationModalProps) => {
  const { t } = useTranslation('common')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  // Default steps if none provided
  const steps = loadingSteps || [
    'aiModal.steps.initializing',
    'aiModal.steps.analyzing',
    'aiModal.steps.processing',
    'aiModal.steps.generating',
    'aiModal.steps.finalizing'
  ]

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>
    let stepInterval: ReturnType<typeof setInterval>

    if (isOpen && isPending) {
      // Progress simulation
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev // Hold at 90% until complete
          // Slow down as we get higher
          const increment = Math.max(1, (90 - prev) / 10)
          return Math.min(90, prev + increment)
        })
      }, 500)

      // Step rotation
      stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length)
      }, 3000)
    } else if (!isOpen) {
      // Reset on close (delayed to avoid flash)
      const timer = setTimeout(() => {
        setProgress(0)
        setCurrentStep(0)
      }, 300)
      return () => clearTimeout(timer)
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval)
      if (stepInterval) clearInterval(stepInterval)
    }
  }, [isOpen, isPending, steps.length])

  const handleOpenChange = (open: boolean) => {
    if (isPending && !open) {
      // Prevent closing while pending
      return
    }
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
                    ) : (
                        <Sparkles className="w-10 h-10 text-primary" />
                    )}
                </div>
              </div>
              <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground">
                  {description}
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
                        {t(steps[currentStep], { defaultValue: steps[currentStep] })} {/* Fallback if key not found */}
                    </motion.span>
                </AnimatePresence>
                <span>{Math.round(progress)}%</span>
              </div>
              
              <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-primary to-purple-600" />
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 py-2 px-3 rounded-full w-fit mx-auto">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t('aiModal.doNotClose', 'Пожалуйста, не закрывайте окно')}</span>
              </div>
            </div>
          </div>
        </AIBorder>
      </DialogContent>
    </Dialog>
  )
}