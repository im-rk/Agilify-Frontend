import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IssueCard } from './IssueCard';
import { cn } from 'cn';

export function BoardColumn({ id, title, issues }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{issues.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-24 flex-1 flex-col gap-2 rounded-xl border border-transparent p-1.5 transition-colors',
          isOver && 'border-border bg-muted/40',
        )}
      >
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
