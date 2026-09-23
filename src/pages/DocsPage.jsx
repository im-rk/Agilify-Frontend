import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCreateDoc, useDocs } from '@/hooks/useDocs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DocsPage() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { data: docs, isLoading } = useDocs(key);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Docs</h1>
          <p className="text-sm text-muted-foreground">Live, collaborative — edits sync in real time.</p>
        </div>
        <CreateDocDialog projectKey={key} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : !docs?.length ? (
        <Card className="items-center rounded-xl border-dashed border-border p-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <FileText className="size-5 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No docs yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create one to start writing with your team.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <Card
              key={doc.id}
              onClick={() => navigate(`/projects/${key}/docs/${doc.id}`)}
              className="cursor-pointer gap-2 rounded-xl border-border p-5 transition-colors hover:border-muted-foreground/40"
            >
              <h3 className="font-medium leading-tight">{doc.title}</h3>
              <p className="text-xs text-muted-foreground">
                Edited {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })} · {doc.createdByName}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateDocDialog({ projectKey }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const createDoc = useCreateDoc(projectKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const doc = await createDoc.mutateAsync(title || undefined);
    setOpen(false);
    setTitle('');
    navigate(`/projects/${projectKey}/docs/${doc.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus />New doc</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>New doc</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="doc-title" className="mb-1.5 block">Title</Label>
            <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" autoFocus />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createDoc.isPending}>
              {createDoc.isPending ? 'Creating…' : 'Create doc'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
