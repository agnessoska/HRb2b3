import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTokenCalculation, type OperationType } from '@/shared/hooks/useTokenCalculation';

interface TokenCostBannerProps {
  operationType: OperationType;
  inputString?: string;
  multiplier?: number;
  className?: string;
  onBuyTokens?: () => void;
}

export const TokenCostBanner = ({
  operationType,
  inputString,
  multiplier = 1,
  className,
  onBuyTokens
}: TokenCostBannerProps) => {
  const { t } = useTranslation(['common', 'payments']);
  const { calculation, isLoading, currentBalance } = useTokenCalculation(operationType, inputString, multiplier);

  if (isLoading) {
    return (
      <Card className={cn("p-4 flex items-center justify-center gap-2 animate-pulse", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t('common:loading')}...</span>
      </Card>
    );
  }

  if (!calculation) return null;

  const { isAI, expectedCost, maxCost, hasEnough, balanceAfter } = calculation;

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isAI ? t('payments:tokenUsage.aiEstimate') : t('payments:tokenUsage.fixedCost')}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">
                {isAI ? `~${expectedCost.toLocaleString()}` : expectedCost.toLocaleString()} 🪙
              </div>
              {isAI && (
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {t('payments:tokenUsage.max')}: {maxCost.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('payments:tokenUsage.currentBalance')}:</span>
              <span className="font-medium text-foreground">{currentBalance.toLocaleString()} 🪙</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('payments:tokenUsage.remaining')}:</span>
              <span className={cn("font-medium", hasEnough ? "text-emerald-600" : "text-destructive")}>
                {(hasEnough ? balanceAfter : currentBalance).toLocaleString()} 🪙
              </span>
            </div>
          </div>

        </div>
      </Card>

      {!hasEnough && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 py-3">
          <AlertCircle className="h-4 w-4" />
          <div className="flex flex-col gap-2 w-full">
            <AlertTitle className="text-xs font-bold leading-none">
              {t('payments:tokenUsage.insufficientTokens')}
            </AlertTitle>
            <AlertDescription className="text-xs flex items-center justify-between">
              <span>{t('payments:tokenUsage.needMore', { count: maxCost - currentBalance })}</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 font-bold text-destructive hover:text-destructive/80"
                onClick={onBuyTokens || (() => window.location.href = '/hr/buy-tokens')}
              >
                {t('payments:tokenUsage.buyTokens')} →
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};