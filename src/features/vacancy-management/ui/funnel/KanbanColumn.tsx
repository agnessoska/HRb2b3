import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CandidateCard } from './CandidateCard.tsx';
import type { Application } from '../../types';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  applications: Application[];
  onStatusChange?: (applicationId: string, newStatus: string) => void;
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
}: KanbanColumnProps) => {
  const { t } = useTranslation('vacancies');

  return (
    <div
      className={cn(
        'flex flex-col w-full md:w-80 flex-shrink-0 bg-muted/40 rounded-xl border border-border/50 transition-all duration-200 hover:shadow-md border-t-4'
      )}
      style={{ borderTopColor: statusColors[id] || '#6b7280' }}
    >
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[id] || '#6b7280' }} />
            <h3 className="font-semibold text-sm text-foreground/80 uppercase tracking-wide">{title}</h3>
          </div>
          <Badge variant="secondary" className="ml-2 bg-background/50 font-mono text-xs">
            {count}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3 min-h-[150px] scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground/50 border-2 border-dashed border-muted-foreground/10 rounded-lg mx-1">
            <span className="text-xs font-medium">{t('funnel.noCandidates')}</span>
          </div>
        ) : (
          applications.map((application: Application) => (
            <CandidateCard
              key={application.id}
              application={application}
              onStatusChange={(status) => onStatusChange?.(application.id, status)}
            />
          ))
        )}
      </div>
    </div>
  );
};
