import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { TTransaction } from '../types'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

interface TransactionsTableProps {
  transactions: TTransaction[]
  isLoading: boolean
}

export const TransactionsTable = ({
  transactions,
  isLoading,
}: TransactionsTableProps) => {
  const { t } = useTranslation('payments')

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (transactions.length === 0) {
    return <p>{t('noTransactions')}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('date')}</TableHead>
          <TableHead>{t('amount')}</TableHead>
          <TableHead>{t('tokens')}</TableHead>
          <TableHead>{t('status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map(tx => (
          <TableRow key={tx.id}>
            <TableCell>
              {format(new Date(tx.created_at), 'dd.MM.yyyy HH:mm')}
            </TableCell>
            <TableCell>{tx.amount} RUB</TableCell>
            <TableCell>{tx.tokens_amount}</TableCell>
            <TableCell>
              <Badge
                variant={
                  tx.status === 'success'
                    ? 'success'
                    : tx.status === 'failed'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {t(`statuses.${tx.status}`)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
