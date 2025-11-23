import { useGetColleagues } from '../api/getColleagues'
import { useGetTeamSpendingStats } from '../api/getTeamSpendingStats'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ru, enUS, kk } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { Loader2, User, ChevronDown, ChevronRight, Coins } from 'lucide-react'
import { useState, Fragment } from 'react'
import { HRCandidatesList } from './HRCandidatesList'
import { Button } from '@/components/ui/button'
import { cn, formatCompactNumber } from '@/lib/utils'

export const TeamMembersTable = () => {
  const { t, i18n } = useTranslation(['team', 'common'])
  const { data: colleagues, isLoading } = useGetColleagues()
  const { data: spendingStats } = useGetTeamSpendingStats()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru
      case 'kk': return kk // date-fns might not support kk fully, fallback to ru or en
      default: return enUS
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!colleagues || colleagues.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {t('noMembers')}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('member')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('spentTokens')}</TableHead>
            <TableHead>{t('joinedAt')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colleagues.map((member) => {
            const stats = spendingStats?.find(s => s.id === member.id)
            
            return (
            <Fragment key={member.id}>
              <TableRow
                className={cn("group cursor-pointer", expandedRows.has(member.id) && "bg-muted/30")}
                onClick={() => toggleRow(member.id)}
              >
                <TableCell className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-transparent">
                    {expandedRows.has(member.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.full_name?.substring(0, 2).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{member.full_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role === 'owner' ? t('roles.owner') : t('roles.member')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={member.is_active ? 'success' : 'secondary'} className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                    {member.is_active ? t('statuses.active') : t('statuses.inactive')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-mono text-sm">
                    <Coins className="h-3 w-3 text-muted-foreground" />
                    <span title={new Intl.NumberFormat('ru-RU').format(stats?.total_spent || 0)}>
                      {formatCompactNumber(stats?.total_spent || 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {format(new Date(member.created_at), 'd MMMM yyyy', { locale: getDateLocale() })}
                </TableCell>
              </TableRow>
              {expandedRows.has(member.id) && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <div className="p-4 sm:p-6 bg-muted/5 border-b space-y-4 sm:space-y-6">
                      {/* Spending Stats Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pl-0 sm:pl-12">
                        <div className="bg-card p-3 rounded-lg border shadow-sm">
                          <span className="text-[10px] sm:text-xs text-muted-foreground block mb-1 truncate">{t('spendingStats.aiOperations')}</span>
                          <span className="text-sm sm:text-lg font-bold text-primary truncate block" title={new Intl.NumberFormat('ru-RU').format(stats?.ai_tokens || 0)}>
                            {formatCompactNumber(stats?.ai_tokens || 0)}
                          </span>
                        </div>
                        <div className="bg-card p-3 rounded-lg border shadow-sm">
                          <span className="text-[10px] sm:text-xs text-muted-foreground block mb-1 truncate">{t('spendingStats.invitations')}</span>
                          <span className="text-sm sm:text-lg font-bold text-primary truncate block" title={new Intl.NumberFormat('ru-RU').format(stats?.invite_tokens || 0)}>
                            {formatCompactNumber(stats?.invite_tokens || 0)}
                          </span>
                        </div>
                        <div className="bg-card p-3 rounded-lg border shadow-sm col-span-2 sm:col-span-1">
                          <span className="text-[10px] sm:text-xs text-muted-foreground block mb-1 truncate">{t('spendingStats.talentMarket')}</span>
                          <span className="text-sm sm:text-lg font-bold text-primary truncate block" title={new Intl.NumberFormat('ru-RU').format(stats?.market_tokens || 0)}>
                            {formatCompactNumber(stats?.market_tokens || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="pl-0 sm:pl-12">
                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('invitedCandidatesTitle')} ({member.candidates_count || 0})</h4>
                        <HRCandidatesList hrId={member.id} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          )})}
        </TableBody>
      </Table>
    </div>
  )
}