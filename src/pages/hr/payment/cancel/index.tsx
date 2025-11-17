import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/shared/ui/layouts';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentCancelPage = () => {
  const { t } = useTranslation('payments');

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="mt-4 text-2xl">{t('cancel.title')}</CardTitle>
            <CardDescription>{t('cancel.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              {t('cancel.message')}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link to="/hr/buy-tokens">{t('cancel.tryAgainButton')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCancelPage;
