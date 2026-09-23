import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Rocket } from 'lucide-react';
import { useCompleteSprint, useCreateSprint, useSprints, useStartSprint } from '@/hooks/useSprints';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SPRINT_BADGE = {
  PLANNED: 'secondary',
  ACTIVE: 'default',
  CLOSED: 'outline',
};

export default function SprintsPage() {
  const { key } = useParams();
  const { data: sprints, isLoading } = useSprints(key);
  const startSprint = useStartSprint(key);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Sprints</h1>
          <p className="text-sm text-muted-foreground">Only one sprint can be active at a time.</p>
        </div>
        <CreateSprintDialog projectKey={key} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !sprints?.length ? (
        <Card className="items-center rounded-xl border-dashed border-border p-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Rocket className="size-5 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No sprints yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create one to start planning.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className="gap-3 rounded-xl border-border p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-medium leading-tight">{sprint.name}</h3>
                <Badge variant={SPRINT_BADGE[sprint.status]}>{sprint.status}</Badge>
              </div>
              {sprint.goal && <p className="line-clamp-2 text-sm text-muted-foreground">{sprint.goal}</p>}
              <p className="text-xs text-muted-foreground">
                {format(new Date(sprint.startDate), 'MMM d')} – {format(new Date(sprint.endDate), 'MMM d, yyyy')}
              </p>
              <div className="mt-1 flex gap-2">
                {sprint.status === 'PLANNED' && (
                  <Button size="sm" variant="secondary" onClick={() => startSprint.mutate(sprint.id)}>
                    Start sprint
                  </Button>
                )}
                {sprint.status === 'ACTIVE' && <CompleteSprintDialog projectKey={key} sprint={sprint} sprints={sprints} />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSprintDialog({ projectKey }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const createSprint = useCreateSprint(projectKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSprint.mutateAsync({ name, goal: goal || undefined, startDate, endDate });
    setOpen(false);
    setName('');
    setGoal('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New sprint</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="sprint-name">Name</Label>
              <Input id="sprint-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sprint-goal">Goal</Label>
              <Textarea id="sprint-goal" value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="start-date">Start date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="end-date">End date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createSprint.isPending}>
              {createSprint.isPending ? 'Creating…' : 'Create sprint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CompleteSprintDialog({ projectKey, sprint, sprints }) {
  const [open, setOpen] = useState(false);
  const [rolloverSprintId, setRolloverSprintId] = useState('');
  const completeSprint = useCompleteSprint(projectKey);
  const otherPlanned = sprints.filter((s) => s.id !== sprint.id && s.status === 'PLANNED');

  const handleComplete = async () => {
    await completeSprint.mutateAsync({ sprintId: sprint.id, rolloverSprintId: rolloverSprintId || null });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Complete sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete "{sprint.name}"</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label className="mb-2 block">Unfinished issues go to</Label>
          <Select value={rolloverSprintId} onValueChange={setRolloverSprintId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Backlog" /></SelectTrigger>
            <SelectContent>
              {otherPlanned.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleComplete} disabled={completeSprint.isPending}>
            {completeSprint.isPending ? 'Completing…' : 'Complete sprint'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
