import { Link, useParams } from 'react-router-dom';
import { ListTodo } from 'lucide-react';
import { useBacklog } from '@/hooks/useBoard';
import { useAssignIssueToSprint } from '@/hooks/useIssues';
import { useSprints } from '@/hooks/useSprints';
import { CreateIssueDialog } from '@/components/issue/CreateIssueDialog';
import { PriorityBadge } from '@/components/issue/PriorityBadge';
import { AssigneeAvatar } from '@/components/issue/AssigneeAvatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BacklogPage() {
  const { key } = useParams();
  const { data: issues, isLoading } = useBacklog(key);
  const { data: sprints } = useSprints(key);
  const plannedSprints = sprints?.filter((s) => s.status !== 'CLOSED') ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Backlog</h1>
          <p className="text-sm text-muted-foreground">Issues not yet assigned to a sprint.</p>
        </div>
        <CreateIssueDialog projectKey={key} />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : !issues?.length ? (
        <Card className="items-center rounded-xl border-dashed border-border p-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <ListTodo className="size-5 text-muted-foreground" />
          </div>
          <h3 className="font-medium">Backlog is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">Every issue is either in a sprint or doesn't exist yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {issues.map((issue) => (
            <BacklogRow key={issue.id} issue={issue} projectKey={key} sprints={plannedSprints} />
          ))}
        </div>
      )}
    </div>
  );
}

function BacklogRow({ issue, projectKey, sprints }) {
  const assignToSprint = useAssignIssueToSprint(projectKey, issue.id);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40">
      <Link
        to={`/projects/${projectKey}/issues/${issue.id}`}
        className="font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        {issue.issueKey}
      </Link>
      <Link to={`/projects/${projectKey}/issues/${issue.id}`} className="flex-1 truncate text-sm hover:underline">
        {issue.title}
      </Link>
      <PriorityBadge priority={issue.priority} />
      <AssigneeAvatar name={issue.assigneeName} />
      <Select onValueChange={(sprintId) => assignToSprint.mutate(sprintId)}>
        <SelectTrigger size="sm" className="h-7 w-40 text-xs">
          <SelectValue placeholder="Move to sprint…" />
        </SelectTrigger>
        <SelectContent>
          {sprints.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">No open sprints</div>
          ) : (
            sprints.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
