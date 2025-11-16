import { useOrganization } from '@/shared/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/shared/ui/layouts';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation } from '@tanstack/react-query';
import { createRobokassaInvoice } from '@/features/payments/api/createRobokassaInvoice';
import type { RobokassaParams } from '@/features/payments/api/createRobokassaInvoice';
import { useState } from 'react';
import { toast } from 'sonner';
import { RobokassaForm } from '@/features/payments/ui/RobokassaForm';

const tokenPackages = [
  { name: 'Starter', tokens: 50000, price: 5000, description: 'For small teams and startups' },
  { name: 'Professional', tokens: 200000, price: 18000, description: 'For growing businesses' },
  { name: 'Enterprise', tokens: 500000, price: 40000, description: 'For large-scale hiring' },
];

const BuyTokensPage = () => {
  const { data: organization, isLoading: isLoadingOrg } = useOrganization();
  const [paymentParams, setPaymentParams] = useState<RobokassaParams | null>(null);

  const { mutate: createInvoice, isPending } = useMutation({
    mutationFn: createRobokassaInvoice,
    onSuccess: (data) => {
      toast.success('Redirecting to payment gateway...');
      setPaymentParams(data);
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });

  const handlePayment = (amount: number, tokens: number) => {
    if (!organization) {
      toast.error('Organization data is not loaded yet.');
      return;
    }
    createInvoice({
      organization_id: organization.id,
      amount,
      tokens,
    });
  };

  if (paymentParams) {
    return <RobokassaForm params={paymentParams} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Buy Tokens</h1>
          {isLoadingOrg ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <div className="text-lg">
              Current Balance: <span className="font-semibold text-primary">{organization?.token_balance?.toLocaleString() ?? 0}</span> tokens
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tokenPackages.map((pkg) => (
            <Card key={pkg.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-4xl font-bold">
                  {pkg.tokens.toLocaleString()}
                </div>
                <div className="text-muted-foreground">tokens</div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handlePayment(pkg.price, pkg.tokens)}
                  disabled={isPending || isLoadingOrg}
                >
                  {isPending ? 'Processing...' : `Buy for ${pkg.price.toLocaleString()} RUB`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyTokensPage;
