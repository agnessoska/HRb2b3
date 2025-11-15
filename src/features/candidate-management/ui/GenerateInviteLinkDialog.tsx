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
import { Copy } from 'lucide-react'

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

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink)
    // TODO: Show toast with t('invite_dialog.copy_success_toast')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when dialog closes
      setGeneratedLink('')
      mutation.reset()
    }
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>{t('generate_invite_link')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('generate_invite_link')}</DialogTitle>
          <DialogDescription>
            {t('invite_dialog.description')}
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4">
            <p>{t('invite_dialog.success_prompt')}</p>
            <div className="flex items-center gap-2">
              <Input value={generatedLink} readOnly />
              <Button size="icon" onClick={handleCopy} aria-label={t('invite_dialog.copy_button')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p>{t('invite_dialog.initial_prompt')}</p>
          </div>
        )}

        <DialogFooter>
          {!generatedLink && (
            <Button onClick={handleGenerate} disabled={mutation.isPending}>
              {mutation.isPending
                ? t('invite_dialog.generating_button')
                : t('invite_dialog.generate_button')}
            </Button>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('invite_dialog.close_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
