import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, ListTodo, Rocket, FileText, Zap } from 'lucide-react';
import { cn } from 'cn';

const NAV_ITEMS = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'board', label: 'Board', icon: KanbanSquare },
  { to: 'backlog', label: 'Backlog', icon: ListTodo },
  { to: 'sprints', label: 'Sprints', icon: Rocket },
  { to: 'docs', label: 'Docs', icon: FileText, disabled: true },
];

export function Sidebar() {
  const { key } = useParams();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background md:flex">
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="size-3.5" strokeWidth={2.5} />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight">Agilify</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, disabled }) =>
          disabled ? (
            <span
              key={to}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground/50"
              title="Coming soon"
            >
              <Icon className="size-4" />
              {label}
            </span>
          ) : (
            <NavLink
              key={to}
              to={`/projects/${key}/${to}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
}
