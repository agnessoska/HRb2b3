import { useTranslation } from 'react-i18next';
import { HelpCircle } from '@/shared/ui/HelpCircle';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitCompare } from 'lucide-react';
import { CandidateCard } from './CandidateCard.tsx';
import type { SmartApplication } from '@/shared/types/extended';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  applications: SmartApplication[];
  onStatusChange?: (action: string, applicationId?: string) => void;
  onInviteToInterview?: (applicationId: string) => void;
  onMoveToOffer?: (applicationId: string) => void;
  onOpenInterview?: (sessionId: string) => void;
  onCompare?: () => void;
  onViewComparisonHistory?: () => void;
  compareAvailableCount?: number;
}

const statusColors: Record<string, string> = {
  invited: '#3b82f6', // blue-500
  testing: '#a855f7', // purple-500
  evaluated: '#6366f1', // indigo-500
  interview: '#f97316', // orange-500
  offer: '#22c55e', // green-500
  hired: '#059669', // emerald-600
  rejected: '#ef4444', // red-500
};

export const KanbanColumn = ({
  id,
  title,
  count,
  applications,
  onStatusChange,
  onInviteToInterview,
  onMoveToOffer,
  onOpenInterview,
  onCompare,
  onViewComparisonHistory,
  compareAvailableCount = 0,
}: KanbanColumnProps) => {
  const { t } = useTranslation(['funnel', 'common']);
  
  const isEvaluatedColumn = id === 'evaluated';
  const canCompare = isEvaluatedColumn && compareAvailableCount >= 2;

  return (
    <div
      className={cn(
        'flex flex-col w-full md:w-80 flex-shrink-0 bg-muted/20 rounded-[2rem] border border-border/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border-t-4'
      )}
      style={{ borderTopColor: statusColors[id] || '#6b7280' }}
    >
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" style={{ backgroundColor: statusColors[id] || '#6b7280' }} />
            <h3 className="font-bold text-xs text-foreground/70 uppercase tracking-[0.15em]">{title}</h3>
            {id === 'testing' && <HelpCircle topicId="funnel_testing" iconClassName="h-3.5 w-3.5 opacity-50" />}
            {id === 'evaluated' && <HelpCircle topicId="funnel_evaluated" iconClassName="h-3.5 w-3.5 opacity-50" />}
            {id === 'interview' && <HelpCircle topicId="funnel_interview" iconClassName="h-3.5 w-3.5 opacity-50" />}
            {id === 'offer' && <HelpCircle topicId="funnel_offer" iconClassName="h-3.5 w-3.5 opacity-50" />}
          </div>
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-border/50 font-mono text-[10px] h-6 px-2 rounded-lg">
            {count}
          </Badge>
        </div>
        
        {/* Compare buttons for evaluated column */}
        {isEvaluatedColumn && (
          <div className="space-y-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onCompare}
              disabled={!canCompare}
              className="w-full gap-2 h-9 text-xs font-bold rounded-xl border-border/50 bg-background/50 hover:bg-background transition-all"
            >
              <GitCompare className="h-3.5 w-3.5" />
              {canCompare ? t('compareButton', { count: compareAvailableCount }) : t('compareDisabled')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewComparisonHistory}
              className="w-full gap-2 h-8 text-[10px] uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-opacity"
            >
              {t('compareHistory')}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-[150px] scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-sm text-muted-foreground/30 border-2 border-dashed border-border/50 rounded-[1.5rem] mx-1 bg-muted/5">
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('noCandidates')}</span>
          </div>
        ) : (
          applications.map((application) => (
            <CandidateCard
              key={application.id}
              application={application}
              onStatusChange={onStatusChange}
              onInviteToInterview={onInviteToInterview}
              onMoveToOffer={onMoveToOffer}
              onOpenInterview={onOpenInterview}
            />
          ))
        )}
      </div>
    </div>
  );
};
