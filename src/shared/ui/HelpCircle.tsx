import { useTranslation } from 'react-i18next'
import { HelpCircle as HelpIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface HelpCircleProps {
  topicId: string
  className?: string
  iconClassName?: string
}

export function HelpCircle({ topicId, className, iconClassName }: HelpCircleProps) {
  const { t } = useTranslation('help')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className={cn(
            "inline-flex items-center justify-center rounded-full text-muted-foreground/60 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
            className
          )}
          aria-label={t(`topics.${topicId}.title`)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              // Popover will handle the click
              const target = e.currentTarget as HTMLElement
              target.click()
            }
          }}
        >
          <HelpIcon className={cn("h-4 w-4", iconClassName)} />
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="z-[100] w-80 p-6 rounded-[2rem] border-2 border-border/50 shadow-2xl bg-popover/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="space-y-2">
          <h4 className="font-bold text-lg leading-none tracking-tight text-foreground">
            {t(`topics.${topicId}.title`)}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(`topics.${topicId}.description`)}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
