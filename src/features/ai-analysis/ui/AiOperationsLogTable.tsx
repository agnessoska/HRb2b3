import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { TAiOperation } from '../types'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

interface AiOperationsLogTableProps {
  operations: TAiOperation[]
  isLoading: boolean
}

export const AiOperationsLogTable = ({
  operations,
  isLoading,
}: AiOperationsLogTableProps) => {
  const { t } = useTranslation('payments')

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (operations.length === 0) {
    return <p>{t('noOperations')}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('date')}</TableHead>
          <TableHead>{t('operation')}</TableHead>
          <TableHead>{t('tokensSpent')}</TableHead>
          <TableHead>{t('status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {operations.map(op => (
          <TableRow key={op.id}>
            <TableCell>
              {format(new Date(op.created_at), 'dd.MM.yyyy HH:mm')}
            </TableCell>
            <TableCell>{op.operation_type}</TableCell>
            <TableCell>{op.total_tokens}</TableCell>
            <TableCell>
              <Badge variant={op.success ? 'success' : 'destructive'}>
                {op.success ? t('statuses.success') : t('statuses.failed')}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
