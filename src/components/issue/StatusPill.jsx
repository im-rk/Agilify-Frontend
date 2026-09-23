const STATUS_STYLE = {
  BACKLOG: 'bg-muted text-muted-foreground',
  TODO: 'bg-secondary text-secondary-foreground',
  IN_PROGRESS: 'bg-primary/15 text-primary',
  IN_REVIEW: 'bg-amber-500/15 text-amber-400',
  DONE: 'bg-emerald-500/15 text-emerald-400',
};

export function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {status?.replaceAll('_', ' ')}
    </span>
  );
}
