import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Plus, Zap } from 'lucide-react';
import { useCreateProject, useProjects } from '@/hooks/useProjects';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-3.5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">Agilify</span>
        </div>
        <UserMenu />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pick a workspace, or start a new one.</p>
          </div>
          <CreateProjectDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : !projects?.length ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card
                key={p.id}
                onClick={() => navigate(`/projects/${p.key}/dashboard`)}
                className="cursor-pointer gap-3 rounded-xl border-border p-5 transition-colors hover:border-muted-foreground/40"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium leading-tight">{p.name}</h3>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {p.key}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {p.description || 'No description provided.'}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className={`size-1.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-primary' : 'bg-muted-foreground'}`}
                  />
                  {p.status}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="items-center rounded-xl border-dashed border-border p-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Folder className="size-5 text-muted-foreground" />
      </div>
      <h3 className="font-medium">No projects yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Create your first project to get started.</p>
    </Card>
  );
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const createProject = useCreateProject();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProject.mutateAsync({ name, key: key.toUpperCase(), description: description || undefined });
    setOpen(false);
    setName('');
    setKey('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>A short key (e.g. FOOD) prefixes every issue in this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                pattern="^[A-Z]{2,10}$"
                placeholder="FOOD"
                className="font-mono uppercase"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            {createProject.isError && (
              <p className="text-sm text-destructive">
                {createProject.error?.response?.data?.message || 'Failed to create project.'}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating…' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
