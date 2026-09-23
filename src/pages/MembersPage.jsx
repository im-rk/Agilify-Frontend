import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, X } from 'lucide-react';
import { useAddMember, useMembers, useRemoveMember } from '@/hooks/useMembers';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ROLE_VARIANT = { ADMIN: 'default', DEVELOPER: 'secondary', VIEWER: 'outline' };

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function MembersPage() {
  const { key } = useParams();
  const { user } = useAuth();
  const { data: members, isLoading } = useMembers(key);
  const removeMember = useRemoveMember(key);

  const isAdmin = members?.some((m) => m.userId === user?.id && m.role === 'ADMIN');
  const adminCount = members?.filter((m) => m.role === 'ADMIN').length ?? 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">Who has access to this project.</p>
        </div>
        {isAdmin && <AddMemberDialog projectKey={key} />}
      </div>

      <Card className="gap-0 divide-y divide-border overflow-hidden rounded-xl border-border p-0">
        {isLoading ? (
          <div className="p-5 text-sm text-muted-foreground">Loading…</div>
        ) : (
          members?.map((member) => (
            <div key={member.userId} className="flex items-center gap-3 px-5 py-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-xs font-medium">{initials(member.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{member.fullName}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <Badge variant={ROLE_VARIANT[member.role]}>{member.role}</Badge>
              {isAdmin && !(member.role === 'ADMIN' && adminCount === 1) && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeMember.mutate(member.userId)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

function AddMemberDialog({ projectKey }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('DEVELOPER');
  const { data: results } = useUserSearch(email);
  const addMember = useAddMember(projectKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await addMember.mutateAsync({ userId: selectedUser.id, role });
    setOpen(false);
    setEmail('');
    setSelectedUser(null);
    setRole('DEVELOPER');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus />Add member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Add member</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSelectedUser(null); }}
                placeholder="Search by email…"
                autoFocus
              />
              {email.trim().length >= 2 && !selectedUser && (
                <div className="flex flex-col overflow-hidden rounded-md border border-border">
                  {!results?.length ? (
                    <p className="p-2 text-xs text-muted-foreground">No matching users.</p>
                  ) : (
                    results.map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setEmail(u.email); }}
                        className="flex flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <span>{u.fullName}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {selectedUser && (
                <p className="text-xs text-muted-foreground">Selected: {selectedUser.fullName}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="DEVELOPER">Developer</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!selectedUser || addMember.isPending}>
              {addMember.isPending ? 'Adding…' : 'Add member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
