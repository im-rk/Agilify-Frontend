import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ListChecks, Rocket, CircleDot, CheckCircle2 } from 'lucide-react';
import { useProjectIssues } from '@/hooks/useIssues';
import { useActiveBoard } from '@/hooks/useBoard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/issue/StatusPill';
import { PriorityBadge } from '@/components/issue/PriorityBadge';

const STATUS_ORDER = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function DashboardPage() {
  const { key } = useParams();
  const { data: page, isLoading } = useProjectIssues(key, { size: 200 });
  const { data: board } = useActiveBoard(key);

  const issues = page?.content ?? [];

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
    for (const issue of issues) {
      byStatus[issue.status] = (byStatus[issue.status] ?? 0) + 1;
    }
    return byStatus;
  }, [issues]);

  const recentlyUpdated = useMemo(
    () =>
      [...issues]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 8),
    [issues],
  );

  const doneCount = counts.DONE ?? 0;
  const totalCount = issues.length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={ListChecks} label="Total issues" value={totalCount} />
        <StatTile icon={CircleDot} label="In progress" value={counts.IN_PROGRESS ?? 0} accent />
        <StatTile icon={CheckCircle2} label="Done" value={doneCount} />
        <StatTile
          icon={Rocket}
          label="Active sprint"
          value={board?.sprint?.name ?? '—'}
          hint={board ? `${board.issues.length} issues` : 'No sprint running'}
        />
      </div>

      <Card className="gap-4 rounded-xl border-border p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Status breakdown</h2>
        <div className="flex flex-col gap-2.5">
          {STATUS_ORDER.map((status) => {
            const count = counts[status] ?? 0;
            const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <StatusPill status={status} />
                </div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="gap-4 rounded-xl border-border p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Recently updated</h2>
        {recentlyUpdated.length === 0 ? (
          <p className="text-sm text-muted-foreground">No issues yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recentlyUpdated.map((issue) => (
              <div key={issue.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="font-mono text-xs text-muted-foreground">{issue.issueKey}</span>
                <span className="flex-1 truncate text-sm">{issue.title}</span>
                <PriorityBadge priority={issue.priority} />
                <StatusPill status={issue.status} />
                <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, hint, accent }) {
  return (
    <Card className="gap-1 rounded-xl border-border p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`size-4 ${accent ? 'text-primary' : ''}`} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="font-display text-2xl font-semibold tracking-tight">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Card>
  );
}
