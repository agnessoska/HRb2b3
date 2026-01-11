import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Copy, Check, Loader2 } from 'lucide-react'
import { useCreateInvitation } from '../api/createInvitation'
import { toast } from 'sonner'
import { TokenCostBanner } from '@/shared/ui/TokenCostBanner'
import { useTokenCalculation } from '@/shared/hooks/useTokenCalculation'
import { HelpCircle } from '@/shared/ui/HelpCircle'

export const InviteMemberDialog = () => {
  const { t } = useTranslation(['team', 'common'])
  const [isOpen, setIsOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { calculation } = useTokenCalculation('hr_invitation')

  const { mutate: createInvitation, isPending } = useCreateInvitation()

  const onGenerateLink = () => {
    createInvitation({}, {
      onSuccess: (data) => {
        if (data.success && data.token) {
          const link = `${window.location.origin}/auth/login?token=${data.token}`
          setInviteLink(link)
          toast.success(t('invite.success'))
        } else {
          toast.error(data.error || t('invite.error'))
        }
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success(t('invite.copied'))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetDialog = () => {
    setInviteLink(null)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetDialog()}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('invite.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{t('invite.title')}</DialogTitle>
            <HelpCircle topicId="candidates_base" />
          </div>
          <DialogDescription>
            {t('invite.description')}
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg border text-center">
              <p className="text-sm font-medium mb-2 text-muted-foreground">{t('invite.readyText')}</p>
              <div className="flex items-center gap-2">
                <Input readOnly value={inviteLink} className="bg-background" />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={resetDialog}>
              {t('common:done')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <p className="text-sm text-muted-foreground text-center px-4">
              {t('invite.description')}
            </p>

            <TokenCostBanner operationType="hr_invitation" className="mx-auto max-w-[320px]" />

            <DialogFooter className="sm:justify-center gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                {t('common:cancel')}
              </Button>
              <Button
                onClick={onGenerateLink}
                disabled={isPending || (calculation !== null && !calculation.hasEnough)}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common:processing')}...
                  </>
                ) : (
                  t('invite.generateLink')
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}