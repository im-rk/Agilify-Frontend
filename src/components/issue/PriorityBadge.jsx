import { ChevronsUp, ChevronUp, Minus, ChevronDown } from 'lucide-react';

const PRIORITY = {
  P1: { label: 'P1', icon: ChevronsUp, className: 'text-destructive' },
  P2: { label: 'P2', icon: ChevronUp, className: 'text-primary' },
  P3: { label: 'P3', icon: Minus, className: 'text-muted-foreground' },
  P4: { label: 'P4', icon: ChevronDown, className: 'text-muted-foreground' },
};

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] ?? PRIORITY.P3;
  const Icon = p.icon;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${p.className}`}>
      <Icon className="size-3.5" />
      {p.label}
    </span>
  );
}
