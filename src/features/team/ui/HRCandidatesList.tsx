import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ru, enUS, kk } from 'date-fns/locale'
import { User } from 'lucide-react'

interface Candidate {
  id: string
  full_name: string
  category_name: string
  created_at: string
  tests_completed: number
}

interface HRCandidatesListProps {
  hrId: string
}

export const HRCandidatesList = ({ hrId }: HRCandidatesListProps) => {
  const { t, i18n } = useTranslation(['team', 'common'])

  const localeMap = {
    ru: ru,
    en: enUS,
    kk: kk,
  }
  const dateLocale = localeMap[i18n.language as keyof typeof localeMap] || enUS

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['hr-candidates', hrId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_candidates_by_hr', {
        p_hr_id: hrId,
      })

      if (error) throw error
      return data as unknown as Candidate[]
    },
  })

  if (isLoading) {
    return <Skeleton className="h-12 w-full" />
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-md">
        {t('noCandidatesInvited', 'Этот сотрудник пока никого не пригласил')}
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">{t('candidateName', 'Имя кандидата')}</TableHead>
            <TableHead>{t('category', 'Категория')}</TableHead>
            <TableHead>{t('tests', 'Тесты')}</TableHead>
            <TableHead className="text-right">{t('invitedAt', 'Дата приглашения')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id} className="hover:bg-muted/50">
              <TableCell className="font-medium flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                {candidate.full_name}
              </TableCell>
              <TableCell>{candidate.category_name || '-'}</TableCell>
              <TableCell>
                <span className={candidate.tests_completed === 6 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                  {candidate.tests_completed} / 6
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {format(new Date(candidate.created_at), 'dd MMM yyyy', { locale: dateLocale })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}