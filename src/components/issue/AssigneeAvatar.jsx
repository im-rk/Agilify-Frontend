import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function AssigneeAvatar({ name, size = 'size-6' }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar className={size}>
          <AvatarFallback className="bg-secondary text-[10px] font-medium">{initials(name)}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{name || 'Unassigned'}</TooltipContent>
    </Tooltip>
  );
}
