import { useOrganization } from '@/shared/hooks/useOrganization'
import { useQuery } from '@tanstack/react-query'
import { getPaymentTransactions } from '@/features/payments/api/getPaymentTransactions'
import { getAiOperationsLog } from '@/features/ai-analysis/api/getAiOperationsLog'
import { TransactionsTable } from '@/features/payments/ui/TransactionsTable'
import { AiOperationsLogTable } from '@/features/ai-analysis/ui/AiOperationsLogTable'
import { useTranslation } from 'react-i18next'
import { HelpCircle } from '@/shared/ui/HelpCircle'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BillingPage = () => {
  const { t } = useTranslation('payments')
  const { data: organization, isLoading: isOrgLoading } = useOrganization()

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['paymentTransactions', organization?.id],
    queryFn: () => getPaymentTransactions(organization!.id),
    enabled: !!organization,
  })

  const { data: operations, isLoading: isOperationsLoading } = useQuery({
    queryKey: ['aiOperationsLog', organization?.id],
    queryFn: () => getAiOperationsLog(organization!.id),
    enabled: !!organization,
  })

  if (isOrgLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <HelpCircle topicId="billing_tokens" iconClassName="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">{t('currentBalance')}</p>
            <p className="text-2xl font-bold">
              {organization?.token_balance} {t('tokens')}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsTable
                transactions={transactions || []}
                isLoading={isTransactionsLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('tokenExpenses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AiOperationsLogTable
                operations={operations || []}
                isLoading={isOperationsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

export default BillingPage
