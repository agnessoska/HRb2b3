import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SortableCandidateCard } from './SortableCandidateCard.tsx';
import type { Application } from '../../types';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  applications: Application[];
}

export const KanbanColumn = ({
  id,
  title,
  count,
  applications,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-80 flex-shrink-0 bg-muted/30 rounded-lg transition-colors',
        isOver && 'ring-2 ring-primary bg-primary/5'
      )}
    >
      <div className="p-3 border-b bg-background rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="secondary" className="ml-2">
            {count}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
        <SortableContext
          items={applications.map(app => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Нет кандидатов
            </div>
          ) : (
            applications.map((application: Application) => (
              <SortableCandidateCard
                key={application.id}
                application={application}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};
