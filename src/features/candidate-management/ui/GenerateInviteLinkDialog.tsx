import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'
import { generateInviteToken } from '../api/generateInviteToken'
import { Copy, Link2, Loader2, CheckCircle2, UserPlus } from 'lucide-react'

interface GenerateTokenResponse {
  success: boolean
  token: string
  token_id: string
  invite_url: string
  tokens_spent: number
  new_balance: number
}

export function GenerateInviteLinkDialog() {
  const { t } = useTranslation('candidates')
  const [open, setOpen] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)

  const mutation = useMutation<GenerateTokenResponse, Error, void>({
    mutationFn: generateInviteToken,
    onSuccess: (data) => {
      if (data?.invite_url) {
        setGeneratedLink(data.invite_url)
      }
      // TODO: Show toast with token cost and new balance
      // TODO: Invalidate queries to refetch token balance in header
    },
  })

  const handleGenerate = () => {
    mutation.mutate()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    // TODO: Show toast with t('invite_dialog.copy_success_toast')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when dialog closes
      setGeneratedLink('')
      setCopied(false)
      mutation.reset()
    }
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          {t('generate_invite_link')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{t('generate_invite_link')}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base">
            {t('invite_dialog.description')}
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">{t('invite_dialog.success_prompt')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with candidates to invite them to register.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={generatedLink}
                  readOnly
                  className="pr-10 font-mono text-sm"
                />
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button
                size="icon"
                onClick={handleCopy}
                variant={copied ? "default" : "outline"}
                aria-label={t('invite_dialog.copy_button')}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {mutation.data && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="text-muted-foreground">
                  Cost: <span className="font-semibold text-foreground">{mutation.data.tokens_spent} tokens</span>
                  {' • '}
                  Balance: <span className="font-semibold text-foreground">{mutation.data.new_balance} tokens</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed p-6 text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {t('invite_dialog.initial_prompt')}
            </p>
            <p className="text-xs text-muted-foreground">
              Cost: 500 tokens per link
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!generatedLink && (
            <Button onClick={handleGenerate} disabled={mutation.isPending} className="gap-2">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('invite_dialog.generating_button')}
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  {t('invite_dialog.generate_button')}
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {generatedLink ? 'Done' : t('invite_dialog.close_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
