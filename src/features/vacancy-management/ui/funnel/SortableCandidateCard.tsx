import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CandidateCard } from './CandidateCard.tsx';
import type { Application } from '../../types';

interface SortableCandidateCardProps {
  application: Application;
}

export const SortableCandidateCard = ({
  application
}: SortableCandidateCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CandidateCard
        application={application}
        isDragging={isDragging}
      />
    </div>
  );
};
