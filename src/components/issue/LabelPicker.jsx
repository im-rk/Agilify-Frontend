import { Tag, Plus } from 'lucide-react';
import { useIssueLabels, useProjectLabels, useToggleIssueLabel } from '@/hooks/useLabels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LabelPicker({ projectKey, issueId }) {
  const { data: allLabels } = useProjectLabels(projectKey);
  const { data: attached } = useIssueLabels(projectKey, issueId);
  const toggle = useToggleIssueLabel(projectKey, issueId);
  const attachedIds = new Set(attached?.map((l) => l.id));

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
        <DropdownMenuContent align="start">
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
