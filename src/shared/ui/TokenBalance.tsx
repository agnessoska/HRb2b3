import { useOrganization } from '@/shared/hooks/useOrganization';
import { Coins } from 'lucide-react';
import { cn, formatCompactNumber } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface TokenBalanceProps {
  className?: string;
}

export const TokenBalance = ({ className }: TokenBalanceProps) => {
  const { data: organization, isLoading } = useOrganization();
  const { t, i18n } = useTranslation('common');

  if (isLoading || !organization) {
    return null;
  }

  const formattedBalance = formatCompactNumber(organization.token_balance);
  const fullBalance = new Intl.NumberFormat(i18n.language).format(organization.token_balance);

  return (
    <Link
      to="/hr/buy-tokens"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 group whitespace-nowrap",
        className
      )}
      title={`${t('buyTokens')} (${fullBalance})`}
    >
      <Coins className="w-4 h-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
      <span className="text-sm font-medium text-primary">
        {formattedBalance}
      </span>
    </Link>
  );
};