import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetOrganizationInvitations } from '../api/getOrganizationInvitations'
import type { Invitation } from '../api/getOrganizationInvitations'
import { format } from 'date-fns'
import { ru, enUS, kk } from 'date-fns/locale'
import { Mail, User, Calendar, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function InvitationsTable() {
  const { t, i18n } = useTranslation('team')
  const { data: invitations, isLoading } = useGetOrganizationInvitations()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'hr' | 'candidate'>('all')

  const filteredInvitations = useMemo(() => {
    if (!invitations) return []
    if (filter === 'all') return invitations
    return invitations.filter((invite) => invite.type === filter)
  }, [invitations, filter])

  const localeMap = {
    ru: ru,
    en: enUS,
    kk: kk,
  }

  const dateLocale = localeMap[i18n.language as keyof typeof localeMap] || enUS

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t('invitations.copied', 'Ссылка скопирована'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusBadge = (invite: Invitation) => {
    if (invite.is_used) {
      return <Badge variant="success">{t('invitations.status.used', 'Использовано')}</Badge>
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return <Badge variant="destructive">{t('invitations.status.expired', 'Истекло')}</Badge>
    }
    return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">{t('invitations.status.active', 'Активно')}</Badge>
  }

  const getLink = (token: string) => {
    return `${window.location.origin}/auth/login?token=${token}`
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!invitations?.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {t('invitations.empty', 'История приглашений пуста')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'hr' | 'candidate')} className="w-full">
        <TabsList>
          <TabsTrigger value="all">{t('invitations.filter.all', 'Все')}</TabsTrigger>
          <TabsTrigger value="hr">{t('invitations.types.hr', 'Коллеги')}</TabsTrigger>
          <TabsTrigger value="candidate">{t('invitations.types.candidate', 'Кандидаты')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('invitations.type', 'Тип')}</TableHead>
              <TableHead>{t('invitations.link', 'Ссылка')}</TableHead>
              <TableHead>{t('invitations.created', 'Создано')}</TableHead>
              <TableHead>{t('invitations.statusLabel', 'Статус')}</TableHead>
              <TableHead>{t('invitations.usedBy', 'Кем использовано')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvitations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t('invitations.emptyFilter', 'Приглашений не найдено')}
                </TableCell>
              </TableRow>
            )}
            {filteredInvitations.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell>
                <div className="flex items-center gap-2">
                  {invite.type === 'hr' ? (
                    <Badge variant="outline" className="gap-1">
                      <Mail className="h-3 w-3" />
                      {t('invitations.types.hr', 'Коллега')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 bg-secondary/50">
                      <User className="h-3 w-3" />
                      {t('invitations.types.candidate', 'Кандидат')}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono max-w-[150px] truncate">
                    {invite.token}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(getLink(invite.token), invite.id)}
                  >
                    {copiedId === invite.id ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(invite.created_at), 'dd MMM yyyy', { locale: dateLocale })}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/70">
                    by {invite.created_by_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(invite)}</TableCell>
              <TableCell>
                {invite.is_used ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {invite.used_by_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{invite.used_by_name}</span>
                      {invite.invite_email && (
                        <span className="text-xs text-muted-foreground">{invite.invite_email}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}