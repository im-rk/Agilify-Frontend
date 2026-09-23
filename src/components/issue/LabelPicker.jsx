import { useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { useCreateLabel, useIssueLabels, useProjectLabels, useToggleIssueLabel } from '@/hooks/useLabels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SWATCHES = ['#c6ff3d', '#60a5fa', '#f472b6', '#fb923c', '#34d399', '#a78bfa'];

export function LabelPicker({ projectKey, issueId }) {
  const { data: allLabels } = useProjectLabels(projectKey);
  const { data: attached } = useIssueLabels(projectKey, issueId);
  const toggle = useToggleIssueLabel(projectKey, issueId);
  const createLabel = useCreateLabel(projectKey);
  const [newLabelName, setNewLabelName] = useState('');
  const [colour, setColour] = useState(SWATCHES[0]);
  const attachedIds = new Set(attached?.map((l) => l.id));

  const handleCreate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newLabelName.trim()) return;
    const label = await createLabel.mutateAsync({ name: newLabelName.trim(), colour });
    setNewLabelName('');
    toggle.mutate({ labelId: label.id, attached: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {attached?.map((label) => (
        <Badge key={label.id} variant="secondary" style={{ backgroundColor: `${label.colour}26`, color: label.colour }}>
          {label.name}
        </Badge>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            {attached?.length ? <Plus className="size-3.5" /> : <Tag className="size-3.5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Labels</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!allLabels?.length ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">No labels in this project yet</div>
          ) : (
            allLabels.map((label) => (
              <DropdownMenuCheckboxItem
                key={label.id}
                checked={attachedIds.has(label.id)}
                onCheckedChange={() => toggle.mutate({ labelId: label.id, attached: attachedIds.has(label.id) })}
                onSelect={(e) => e.preventDefault()}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: label.colour }} />
                {label.name}
              </DropdownMenuCheckboxItem>
            ))
          )}
          <DropdownMenuSeparator />
          <form onSubmit={handleCreate} className="flex flex-col gap-2 p-2" onClick={(e) => e.stopPropagation()}>
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="New label…"
              className="h-7 text-xs"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {SWATCHES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColour(c)}
                    className={`size-4 rounded-full ${colour === c ? 'ring-2 ring-offset-1 ring-offset-popover ring-foreground' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <Button type="submit" size="sm" className="h-6 px-2 text-xs" disabled={!newLabelName.trim() || createLabel.isPending}>
                Add
              </Button>
            </div>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
