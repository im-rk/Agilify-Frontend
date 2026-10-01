import { useEffect, useState } from 'react';
import { Plus, TriangleAlert } from 'lucide-react';
import { useCreateIssue, useCheckDuplicates, useProjectIssues } from '@/hooks/useIssues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TYPES = ['TASK', 'BUG', 'STORY', 'EPIC'];
const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];

export function CreateIssueDialog({ projectKey }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('TASK');
  const [priority, setPriority] = useState('P3');
  const createIssue = useCreateIssue(projectKey);
  const checkDuplicates = useCheckDuplicates(projectKey);
  const { data: existingIssues } = useProjectIssues(projectKey);
  const [duplicates, setDuplicates] = useState([]);

  // debounced semantic dedup check as the user types a title/description
  useEffect(() => {
    if (!open || title.trim().length < 6) {
      setDuplicates([]);
      return;
    }
    const timer = setTimeout(() => {
      checkDuplicates.mutate(`${title}\n${description}`, {
        onSuccess: (ids) => setDuplicates(ids),
        onError: () => setDuplicates([]),
      });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, open]);

  const duplicateIssues = duplicates
    .map((id) => existingIssues?.content?.find((i) => i.id === id))
    .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createIssue.mutateAsync({ title, description: description || undefined, type, priority });
    setOpen(false);
    setTitle('');
    setDescription('');
    setType('TASK');
    setPriority('P3');
    setDuplicates([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New issue</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            {duplicateIssues.length > 0 && (
              <div className="flex flex-col gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                <div className="flex items-center gap-1.5 font-medium text-amber-500">
                  <TriangleAlert className="size-4" />
                  Looks similar to {duplicateIssues.length === 1 ? 'an existing issue' : 'existing issues'}
                </div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {duplicateIssues.map((i) => (
                    <li key={i.id}>
                      {i.issueKey}: {i.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createIssue.isPending}>
              {createIssue.isPending ? 'Creating…' : 'Create issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
