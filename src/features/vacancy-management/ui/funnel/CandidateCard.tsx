import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { User, MessageSquare, MoreHorizontal, FileText, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Application } from '../../types';

interface CandidateCardProps {
  application: Application;
  onStatusChange?: (status: string) => void;
}

export const CandidateCard = ({
  application,
  onStatusChange,
}: CandidateCardProps) => {
  const { t, i18n } = useTranslation(['funnel', 'tests', 'common']);
  const navigate = useNavigate();
  const lang = i18n.language as 'ru' | 'kk' | 'en';

  const categoryName =
    application.candidate.category?.[`name_${lang}`];

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
const getTestsStatus = () => {
  if (application.candidate.tests_completed === 0) {
    return { color: 'bg-gray-100 text-gray-600 border-gray-200', label: t('tests:noTests') };
  }

  const daysPassed = differenceInDays(
    new Date(),
    new Date(application.candidate.tests_last_updated_at || new Date())
  );
  const monthsPassed = daysPassed / 30;

  if (monthsPassed < 1) return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: t('tests:current') };
  if (monthsPassed < 2) return { color: 'bg-amber-50 text-amber-700 border-amber-200', label: t('tests:expiring') };
  return { color: 'bg-red-50 text-red-700 border-red-200', label: t('tests:expired') };
};

const testsStatus = getTestsStatus();

return (
  <Card
    className="relative overflow-hidden bg-card/60 hover:bg-card/80 backdrop-blur-sm transition-all duration-200 group shadow-sm hover:shadow-md border border-border/50 rounded-xl"
  >
    <CardContent className="p-3 space-y-3">
        {/* Header: Avatar, Name, Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                {getInitials(application.candidate.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold truncate leading-none mb-1">
                {application.candidate.full_name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {categoryName}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('common:actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange?.('move_request')}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {t('funnel:move')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/hr/candidate/${application.candidate.id}`)}>
                <User className="mr-2 h-4 w-4" />
                {t('funnel:profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/hr/chat?candidateId=${application.candidate.id}`)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('funnel:chat')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats: Tests & Compatibility */}
        <div className="flex items-center justify-between gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-colors",
            testsStatus.color
          )}>
            <FileText className="h-3 w-3" />
            <span>{application.candidate.tests_completed}/6</span>
          </div>

          {application.compatibility_score !== null && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-muted",
              application.compatibility_score >= 80 ? "text-emerald-600 bg-emerald-50" :
              application.compatibility_score >= 60 ? "text-amber-600 bg-amber-50" :
              "text-blue-600 bg-blue-50"
            )}>
              <span>{application.compatibility_score}%</span>
            </div>
          )}
        </div>

        {/* Footer: Date & Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(application.created_at), 'dd MMM yyyy')}
          </span>
          {/* Desktop Quick Action: Move */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hidden md:flex hover:bg-muted"
            onClick={() => onStatusChange?.('move_request')}
            title={t('funnel:move')}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
