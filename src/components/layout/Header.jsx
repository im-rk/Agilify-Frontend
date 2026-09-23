import { useNavigate, useParams } from 'react-router-dom';
import { ChevronsUpDown, Check } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const current = projects?.find((p) => p.key === key);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 gap-1.5 px-2 font-display text-[15px] font-semibold tracking-tight"
          >
            {current?.name ?? 'Select project'}
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects?.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => navigate(`/projects/${p.key}/dashboard`)}>
              {p.key === key && <Check className="size-3.5" />}
              <span className={p.key === key ? '' : 'ml-[22px]'}>{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.key}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/projects')}>All projects</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
