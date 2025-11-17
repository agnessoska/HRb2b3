import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/shared/ui/layouts';
import { CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const { t } = useTranslation('payments');
  const [searchParams] = useSearchParams();
  const outSum = searchParams.get('OutSum');
  const invId = searchParams.get('InvId');

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="mt-4 text-2xl">{t('success.title')}</CardTitle>
            <CardDescription>{t('success.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('success.message')}</p>
            <div className="rounded-lg border bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('success.amountPaid')}</span>
                <strong>{outSum ? `${outSum} RUB` : t('success.notAvailable')}</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">{t('success.invoiceId')}</span>
                <strong>{invId || t('success.notAvailable')}</strong>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/hr/dashboard">{t('success.returnButton')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentSuccessPage;
