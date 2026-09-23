import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bug, BookOpen, CheckSquare, Layers } from 'lucide-react';
import { PriorityBadge } from '@/components/issue/PriorityBadge';
import { cn } from 'cn';

const TYPE_ICON = {
  BUG: { icon: Bug, className: 'text-destructive' },
  STORY: { icon: BookOpen, className: 'text-emerald-400' },
  TASK: { icon: CheckSquare, className: 'text-primary' },
  EPIC: { icon: Layers, className: 'text-violet-400' },
};

export function IssueCard({ issue }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
  });

  const type = TYPE_ICON[issue.issueType] ?? TYPE_ICON.TASK;
  const TypeIcon = type.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex cursor-grab flex-col gap-2 rounded-lg border border-border bg-card p-3 active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <p className="text-sm leading-snug">{issue.title}</p>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <TypeIcon className={cn('size-3.5', type.className)} />
          {issue.issueKey}
        </span>
        <PriorityBadge priority={issue.priority} />
      </div>
    </div>
  );
}
