import { formatDistanceToNow } from 'date-fns';
import { useIssueHistory } from '@/hooks/useIssueHistory';
import { Skeleton } from '@/components/ui/skeleton';

const FIELD_LABEL = {
  status: 'status',
  assignee_id: 'assignee',
  sprint_id: 'sprint',
  priority: 'priority',
  title: 'title',
  description: 'description',
  issue_type: 'type',
  story_points: 'story points',
  due_date: 'due date',
};

export function HistoryTimeline({ projectKey, issueId }) {
  const { data: history, isLoading } = useIssueHistory(projectKey, issueId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 rounded" />
        <Skeleton className="h-5 rounded" />
      </div>
    );
  }

  if (!history?.length) {
    return <p className="text-sm text-muted-foreground">No changes recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5 border-l border-border pl-4">
      {history.map((h) => (
        <div key={h.id} className="relative text-xs">
          <span className="absolute -left-[21px] top-1 size-1.5 rounded-full bg-muted-foreground" />
          <span className="text-foreground">{h.changedByName}</span>{' '}
          <span className="text-muted-foreground">
            changed {FIELD_LABEL[h.fieldName] ?? h.fieldName} from{' '}
            <span className="font-mono">{h.oldValue ?? 'none'}</span> to{' '}
            <span className="font-mono">{h.newValue ?? 'none'}</span>
          </span>
          <div className="text-muted-foreground/70">
            {formatDistanceToNow(new Date(h.changedAt), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
}
