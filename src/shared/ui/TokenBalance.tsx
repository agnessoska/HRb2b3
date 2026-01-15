import { useOrganization } from '@/shared/hooks/useOrganization';
import { Coins, Loader2 } from 'lucide-react';
import { cn, formatCompactNumber } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface TokenBalanceProps {
  className?: string;
}

export const TokenBalance = ({ className }: TokenBalanceProps) => {
  const { data: organization, isLoading, isFetching } = useOrganization();
  const { t, i18n } = useTranslation('common');

  if (isLoading || !organization) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted animate-pulse", className)}>
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        <div className="w-8 h-4 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  const formattedBalance = formatCompactNumber(organization.token_balance);
  const fullBalance = new Intl.NumberFormat(i18n.language).format(organization.token_balance);

  return (
    <Link
      to="/hr/buy-tokens"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20 group whitespace-nowrap relative shadow-sm dark:bg-primary/20 dark:border-primary/40 dark:shadow-primary/5",
        className
      )}
      title={`${t('buyTokens')} (${fullBalance})`}
    >
      <Coins className={cn(
        "w-4 h-4 text-primary dark:text-violet-400 group-hover:scale-110 transition-transform flex-shrink-0",
        isFetching && !isLoading && "animate-bounce"
      )} />
      <span className={cn(
        "text-sm font-bold text-primary dark:text-violet-300 transition-opacity",
        isFetching && !isLoading ? "opacity-50" : "opacity-100"
      )}>
        {formattedBalance}
      </span>
    </Link>
  );
};