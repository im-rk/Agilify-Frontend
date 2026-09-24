import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useIssue, useUpdateIssue, useUpdateIssueStatus, useAssignIssue } from '@/hooks/useIssues';
import { useMembers } from '@/hooks/useMembers';
import { useAuth } from '@/context/AuthContext';
import { useToggleWatch, useWatchers } from '@/hooks/useWatchers';
import { CommentThread } from '@/components/issue/CommentThread';
import { HistoryTimeline } from '@/components/issue/HistoryTimeline';
import { LabelPicker } from '@/components/issue/LabelPicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const TYPES = ['TASK', 'BUG', 'STORY', 'EPIC'];
const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const UNASSIGNED = '__unassigned__';

export default function IssueDetailPage() {
  const { key, issueId } = useParams();
  const { data: issue, isLoading } = useIssue(key, issueId);
  const { data: members } = useMembers(key);
  const { user } = useAuth();
  const { data: watchers } = useWatchers(key, issueId);
  const toggleWatch = useToggleWatch(key, issueId);

  const updateIssue = useUpdateIssue(key, issueId);
  const updateStatus = useUpdateIssueStatus(key, issueId);
  const assignIssue = useAssignIssue(key, issueId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!issue) return;
    setTitle(issue.title);
    setDescription(issue.description ?? '');
    setStoryPoints(issue.storyPoints ?? '');
    setDueDate(issue.dueDate ?? '');
  }, [issue]);

  if (isLoading || !issue) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const isWatching = watchers?.some((w) => w.userId === user?.id);
  const isAdmin = members?.some((m) => m.userId === user?.id && m.role === 'ADMIN');

  const saveDetails = () => {
    const payload = {
      title,
      description: description || null,
      type: issue.type,
      priority: issue.priority,
      storyPoints: storyPoints === '' ? null : Number(storyPoints),
      dueDate: dueDate || null,
    };
    // blur fires even when nothing changed — skip the pointless PUT (and the 403 toast a read-only user would get)
    const unchanged =
      payload.title === issue.title &&
      payload.description === (issue.description || null) &&
      payload.storyPoints === (issue.storyPoints ?? null) &&
      payload.dueDate === (issue.dueDate || null);
    if (!unchanged && payload.title.trim()) updateIssue.mutate(payload);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        to={`/projects/${key}/board`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">
          <div>
            <span className="font-mono text-xs text-muted-foreground">{issue.issueKey}</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveDetails}
              className="mt-1 h-auto border-none px-0 text-xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
            />
          </div>

          <LabelPicker projectKey={key} issueId={issueId} />

          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDetails}
              placeholder="Add a description…"
              rows={5}
            />
          </div>

          <Card className="gap-3 rounded-xl border-border p-5">
            <h2 className="text-sm font-medium text-muted-foreground">Comments</h2>
            <CommentThread issueId={issueId} canModerate={isAdmin} />
          </Card>

          <Card className="gap-3 rounded-xl border-border p-5">
            <h2 className="text-sm font-medium text-muted-foreground">History</h2>
            <HistoryTimeline projectKey={key} issueId={issueId} />
          </Card>
        </div>

        <Card className="h-fit gap-4 rounded-xl border-border p-4">
          <Field label="Status">
            <Select value={issue.status} onValueChange={(v) => updateStatus.mutate(v)}>
              <SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replaceAll('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Assignee">
            <Select
              value={issue.assigneeId ?? UNASSIGNED}
              onValueChange={(v) => assignIssue.mutate(v === UNASSIGNED ? null : v)}
            >
              <SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {members?.map((m) => <SelectItem key={m.userId} value={m.userId}>{m.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Type">
            <Select value={issue.type} onValueChange={(v) => updateIssue.mutate({ ...issueForUpdate(issue), type: v })}>
              <SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Priority">
            <Select value={issue.priority} onValueChange={(v) => updateIssue.mutate({ ...issueForUpdate(issue), priority: v })}>
              <SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Story points">
            <Input
              type="number"
              min={0}
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              onBlur={saveDetails}
              className="h-8"
            />
          </Field>

          <Field label="Due date">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} onBlur={saveDetails} className="h-8" />
          </Field>

          <Field label="Reporter">
            <p className="text-sm">{issue.reporterName}</p>
          </Field>

          <Button variant="secondary" size="sm" onClick={() => toggleWatch.mutate(isWatching)}>
            {isWatching ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {isWatching ? 'Unwatch' : 'Watch'}
          </Button>
        </Card>
      </div>
    </div>
  );
}

// PUT /issues/{id} requires the full field set — carry the unchanged fields along
// when only one select (type/priority) changes.
function issueForUpdate(issue) {
  return {
    title: issue.title,
    description: issue.description,
    type: issue.type,
    priority: issue.priority,
    storyPoints: issue.storyPoints,
    dueDate: issue.dueDate,
  };
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
