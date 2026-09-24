import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useDoc, useRenameDoc } from '@/hooks/useDocs';
import { useCrdtDoc } from '@/hooks/useCrdtDoc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocEditorPage() {
  const { key, docId } = useParams();
  const { data: doc, isLoading } = useDoc(key, docId);
  const renameDoc = useRenameDoc(key, docId);
  const { text, setText, connected, saveSnapshot } = useCrdtDoc(key, docId);

  const [title, setTitle] = useState('');
  useEffect(() => {
    if (doc) setTitle(doc.title);
  }, [doc]);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          to={`/projects/${key}/docs`}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`size-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-destructive'}`} />
            {connected ? 'Live' : 'Disconnected'}
          </span>
          <Button size="sm" variant="secondary" onClick={saveSnapshot} disabled={!connected}>
            <Save className="size-3.5" />
            Save version
          </Button>
        </div>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title.trim() && title !== doc.title && renameDoc.mutate(title.trim())}
        className="h-auto border-none px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
      />

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={!connected}
        placeholder={connected ? 'Start writing — everyone with this doc open sees it live…' : 'Not connected — editing is disabled (Developer role or higher is required to edit docs).'}
        className="min-h-[60vh] resize-none rounded-xl border-border p-6 text-sm leading-relaxed"
      />
    </div>
  );
}
