'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Check,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldCheck,
  Terminal,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ROLES, type Role } from '@/lib/roles';
import type { MembershipStatus } from '@/types/cms';
import {
  approveMember,
  getMembers,
  reactivateMember,
  rejectMember,
  setMemberRoles,
  suspendMember,
  updateMemberProfile,
  type AdminMemberRecord,
} from './actions';

const ROLE_LABELS: Record<Role, { label: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full access, including assigning roles.',
  },
  admin: {
    label: 'Admin',
    description: 'Full access except role assignment.',
  },
  content_editor: {
    label: 'Content Editor',
    description: 'Edit site content and manage documents.',
  },
  membership_manager: {
    label: 'Membership Manager',
    description: 'Approve members and manage member records.',
  },
  event_manager: {
    label: 'Event Manager',
    description: 'Manage events and check in attendees.',
  },
  treasurer: {
    label: 'Treasurer',
    description: 'Manage payments, refunds, and financial reports.',
  },
  comms_manager: {
    label: 'Communications Manager',
    description: 'Publish announcements and send communications.',
  },
  committee_lead: {
    label: 'Committee Lead',
    description: 'Manage committees and view the directory.',
  },
  member: {
    label: 'Member',
    description: 'Standard member portal access.',
  },
  visitor: {
    label: 'Visitor',
    description: 'No portal permissions.',
  },
};

type StatusFilter = 'all' | 'pending' | 'approved' | 'inactive';

type ConfirmAction = 'reject' | 'suspend' | 'reactivate';

const CONFIRM_COPY: Record<
  ConfirmAction,
  { title: string; description: string; cta: string; destructive: boolean }
> = {
  reject: {
    title: 'Reject this member?',
    description:
      'They will not gain access to the members portal. You can still approve them later if this changes.',
    cta: 'Reject',
    destructive: true,
  },
  suspend: {
    title: 'Suspend this member?',
    description:
      'They will lose access to member-only content until reactivated. Their record is kept.',
    cta: 'Suspend',
    destructive: true,
  },
  reactivate: {
    title: 'Reactivate this member?',
    description: 'Their membership will be set back to approved and active.',
    cta: 'Reactivate',
    destructive: false,
  },
};

function formatDate(isoDate?: string): string {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-US', { dateStyle: 'medium' });
}

function StatusBadge({ status }: { status: MembershipStatus }) {
  const styles: Record<MembershipStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent',
    approved: 'bg-green-100 text-green-800 hover:bg-green-100 border-transparent',
    suspended: 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-transparent',
    rejected: 'bg-red-100 text-red-800 hover:bg-red-100 border-transparent',
  };
  const labels: Record<MembershipStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    suspended: 'Suspended',
    rejected: 'Rejected',
  };
  return <Badge className={cn('capitalize', styles[status])}>{labels[status]}</Badge>;
}

function RoleBadges({ roles }: { roles: Role[] }) {
  if (roles.length === 0) {
    return <span className="text-xs text-muted-foreground">No roles</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge key={role} variant="outline" className="text-xs font-normal">
          {ROLE_LABELS[role].label}
        </Badge>
      ))}
    </div>
  );
}

export default function AdminMembersPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<AdminMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<{
    member: AdminMemberRecord;
    action: ConfirmAction;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const [editTarget, setEditTarget] = useState<AdminMemberRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editOrganization, setEditOrganization] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [rolesTarget, setRolesTarget] = useState<AdminMemberRecord | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const { members: fetched, error } = await getMembers();
    setMembers(fetched);
    setLoadError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const pendingCount = members.filter((member) => member.membershipStatus === 'pending').length;

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      if (statusFilter === 'pending' && member.membershipStatus !== 'pending') return false;
      if (statusFilter === 'approved' && member.membershipStatus !== 'approved') return false;
      if (
        statusFilter === 'inactive' &&
        member.membershipStatus !== 'suspended' &&
        member.membershipStatus !== 'rejected'
      ) {
        return false;
      }
      if (!query) return true;
      return (
        member.displayName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    });
  }, [members, search, statusFilter]);

  const handleApprove = async (member: AdminMemberRecord) => {
    setPendingId(member.id);
    const result = await approveMember(member.id);
    if ('success' in result) {
      toast({
        title: 'Member Approved',
        description: `${member.displayName || member.email} now has portal access.`,
      });
      await loadMembers();
    } else {
      toast({ variant: 'destructive', title: 'Approval Failed', description: result.error });
    }
    setPendingId(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    const { member, action } = confirmTarget;
    setIsConfirming(true);
    const runner =
      action === 'reject' ? rejectMember : action === 'suspend' ? suspendMember : reactivateMember;
    const result = await runner(member.id);
    if ('success' in result) {
      const past =
        action === 'reject' ? 'rejected' : action === 'suspend' ? 'suspended' : 'reactivated';
      toast({
        title: `Member ${past.charAt(0).toUpperCase()}${past.slice(1)}`,
        description: `${member.displayName || member.email} has been ${past}.`,
      });
      await loadMembers();
    } else {
      toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
    }
    setIsConfirming(false);
    setConfirmTarget(null);
  };

  const openEditDialog = (member: AdminMemberRecord) => {
    setEditTarget(member);
    setEditName(member.displayName);
    setEditOrganization(member.organizationId ?? '');
  };

  const handleSaveProfile = async () => {
    if (!editTarget) return;
    setIsSavingProfile(true);
    const result = await updateMemberProfile(editTarget.id, {
      displayName: editName,
      organizationId: editOrganization.trim() || undefined,
    });
    if ('success' in result) {
      toast({ title: 'Profile Updated', description: 'The member profile has been saved.' });
      setEditTarget(null);
      await loadMembers();
    } else {
      toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
    }
    setIsSavingProfile(false);
  };

  const openRolesDialog = (member: AdminMemberRecord) => {
    setRolesTarget(member);
    setSelectedRoles(member.roles);
  };

  const toggleRole = (role: Role, checked: boolean) => {
    setSelectedRoles((prev) => (checked ? [...new Set([...prev, role])] : prev.filter((item) => item !== role)));
  };

  const handleSaveRoles = async () => {
    if (!rolesTarget) return;
    setIsSavingRoles(true);
    const result = await setMemberRoles(rolesTarget.id, selectedRoles);
    if ('success' in result) {
      toast({
        title: 'Roles Updated',
        description: `Roles for ${rolesTarget.displayName || rolesTarget.email} have been saved.`,
      });
      setRolesTarget(null);
      await loadMembers();
    } else {
      toast({ variant: 'destructive', title: 'Role Update Failed', description: result.error });
    }
    setIsSavingRoles(false);
  };

  const renderActions = (member: AdminMemberRecord) => {
    const isPending = member.membershipStatus === 'pending';
    const isBusy = pendingId === member.id;
    return (
      <div className="flex items-center justify-end gap-2">
        {isPending && (
          <>
            <Button size="sm" onClick={() => handleApprove(member)} disabled={isBusy}>
              {isBusy ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget({ member, action: 'reject' })}
              disabled={isBusy}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEditDialog(member)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openRolesDialog(member)}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Manage Roles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {member.membershipStatus === 'approved' && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmTarget({ member, action: 'suspend' })}
              >
                <UserX className="h-4 w-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            )}
            {(member.membershipStatus === 'suspended' ||
              member.membershipStatus === 'rejected') && (
              <DropdownMenuItem onClick={() => setConfirmTarget({ member, action: 'reactivate' })}>
                <UserCheck className="h-4 w-4 mr-2" />
                Reactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-slate-900">Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review sign-ups, manage membership status, and assign roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{members.length} Total</Badge>
          <Badge
            variant="secondary"
            className={cn(pendingCount > 0 && 'bg-amber-100 text-amber-800 hover:bg-amber-100')}
          >
            {pendingCount} Pending
          </Badge>
        </div>
      </div>
      <Card className="border-slate-200 shadow-none">
      <CardContent className="pt-6">
        {loadError && (
          <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">
                Pending{pendingCount > 0 ? ` (${pendingCount})` : ''}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="inactive">Suspended / Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading members...
          </div>
        ) : filteredMembers.length === 0 && !loadError ? (
          <div className="text-center py-12 text-muted-foreground">
            {members.length === 0
              ? 'No members yet. New sign-ups will appear here.'
              : 'No members match the current filter.'}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                            {(member.displayName || member.email).charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate">{member.displayName || 'Unnamed member'}</div>
                            <div className="truncate text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={member.membershipStatus} />
                      </TableCell>
                      <TableCell className="max-w-[16rem]">
                        <RoleBadges roles={member.roles} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(member.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">{renderActions(member)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold leading-tight">
                        {member.displayName || 'Unnamed member'}
                      </div>
                      <div className="text-sm text-muted-foreground break-all">{member.email}</div>
                    </div>
                    <StatusBadge status={member.membershipStatus} />
                  </div>
                  <RoleBadges roles={member.roles} />
                  <div className="text-sm text-gray-500">Joined {formatDate(member.createdAt)}</div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    {renderActions(member)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update the profile for {editTarget?.email ?? 'this member'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="member-display-name">Display Name</Label>
              <Input
                id="member-display-name"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-organization">Organization (optional)</Label>
              <Input
                id="member-organization"
                value={editOrganization}
                onChange={(event) => setEditOrganization(event.target.value)}
                placeholder="e.g. Alpha Phi Alpha Fraternity, Inc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={isSavingProfile}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile || editName.trim().length < 2}>
              {isSavingProfile ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog
        open={rolesTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRolesTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
            <DialogDescription>
              Assign roles for {rolesTarget?.displayName || rolesTarget?.email || 'this member'}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto space-y-3 py-2 pr-1">
            {ROLES.map((role) => (
              <div key={role} className="flex items-start gap-3">
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={(checked) => toggleRole(role, checked === true)}
                  className="mt-0.5"
                />
                <div className="grid gap-0.5 leading-tight">
                  <Label htmlFor={`role-${role}`} className="font-medium cursor-pointer">
                    {ROLE_LABELS[role].label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[role].description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground border-t pt-3">
            Role changes take effect when the member next signs in or refreshes.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolesTarget(null)} disabled={isSavingRoles}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} disabled={isSavingRoles}>
              {isSavingRoles ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject / Suspend / Reactivate Confirmation */}
      <AlertDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget ? CONFIRM_COPY[confirmTarget.action].title : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget
                ? `${confirmTarget.member.displayName || confirmTarget.member.email}: ${
                    CONFIRM_COPY[confirmTarget.action].description
                  }`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isConfirming}
              className={cn(
                confirmTarget && CONFIRM_COPY[confirmTarget.action].destructive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : undefined
              )}
            >
              {isConfirming
                ? 'Working...'
                : confirmTarget
                  ? CONFIRM_COPY[confirmTarget.action].cta
                  : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </Card>
    </div>
  );
}
