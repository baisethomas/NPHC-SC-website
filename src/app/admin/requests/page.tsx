'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminPageHeader, AdminPanel, AdminCount, AdminEmpty } from '@/components/admin/admin-page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { useRequestMutations } from '@/hooks/useMembers';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDateValue } from '@/lib/dates';
import type { ApiResponse, PaginatedResponse, Request as MemberRequest } from '@/types/members';
import { Check, Eye, Loader2, Terminal, X } from 'lucide-react';

type Filter = 'pending' | 'under_review' | 'approved' | 'denied' | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under review' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'all', label: 'All' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under review',
  approved: 'Approved',
  denied: 'Denied',
  cancelled: 'Cancelled',
};

function humanize(value: string | undefined): string {
  if (!value) return '—';
  const text = value.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Date-only "needed by" values must not shift a day in Pacific time.
const formatDate = formatDateValue;

// The API clamps each page to 50. Follow the cursor so the queue is complete;
// the cap only guards against a runaway loop.
const PAGE_SIZE = 50;
const MAX_PAGES = 20;

function formatBudget(budget?: number): string {
  if (budget === undefined || budget === null) return '—';
  return budget.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function AdminRequestsPage() {
  const { toast } = useToast();
  const { makeRequest } = useApi();
  const { updateStatus, loading: updating } = useRequestMutations();
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [filter, setFilter] = useState<Filter>('pending');
  const [reviewing, setReviewing] = useState<MemberRequest | null>(null);
  const [notes, setNotes] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all: MemberRequest[] = [];
      let cursor: string | undefined;
      let pages = 0;
      let more = true;
      while (more && pages < MAX_PAGES) {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (cursor) params.set('cursor', cursor);
        const res = await makeRequest<ApiResponse<PaginatedResponse<MemberRequest>>>(`/members/requests?${params}`);
        const page = res.data;
        all.push(...(page?.items ?? []));
        cursor = page?.nextCursor;
        more = Boolean(page?.hasMore && cursor);
        pages += 1;
      }
      setRequests(all);
      setTruncated(more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load requests');
    } finally {
      setLoading(false);
    }
    // makeRequest is recreated per render by useApi; the auth user is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, under_review: 0, approved: 0, denied: 0 };
    for (const r of requests) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [requests]);
  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const openReview = (request: MemberRequest) => {
    setReviewing(request);
    setNotes(request.reviewNotes ?? '');
  };

  const decide = async (status: 'under_review' | 'approved' | 'denied') => {
    if (!reviewing) return;
    try {
      await updateStatus(reviewing.id, status, notes.trim() || undefined);
      toast({ title: `Request ${STATUS_LABEL[status].toLowerCase()}`, description: reviewing.title });
      setReviewing(null);
      await refetch();
    } catch (err) {
      toast({
        title: 'Could not update the request',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Requests"
        description="Event proposals, funding asks, resource needs, and policy questions from members. Decide, leave a note, and the member sees it on their portal."
        meta={
          <>
            <AdminCount attention={counts.pending > 0}>{counts.pending} pending</AdminCount>
            <AdminCount>{counts.under_review} under review</AdminCount>
            <AdminCount>{requests.length} total</AdminCount>
            {truncated && <AdminCount attention>Showing the newest {requests.length}; older requests exist</AdminCount>}
          </>
        }
      />

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Could not load requests</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter requests by status">
        {FILTERS.map((f) => {
          const n = f.value === 'all' ? requests.length : counts[f.value] ?? 0;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                filter === f.value
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
              <span className="ml-1.5 tabular-nums opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <AdminPanel>
        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading requests
          </div>
        ) : visible.length === 0 ? (
          <AdminEmpty>
            {filter === 'pending' ? 'No requests waiting on a decision.' : `No ${STATUS_LABEL[filter]?.toLowerCase() ?? ''} requests.`}
          </AdminEmpty>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Needed by</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-[22rem]">
                        <p className="truncate font-semibold">{r.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.submittedByName || r.submittedByEmail}</p>
                      </TableCell>
                      <TableCell className="text-sm">{humanize(r.type)}</TableCell>
                      <TableCell className="text-sm">
                        <span className={cn(r.priority === 'high' && 'font-semibold text-gold')}>{humanize(r.priority)}</span>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">{formatDate(r.requestedDate)}</TableCell>
                      <TableCell className="text-sm tabular-nums">{formatBudget(r.budget)}</TableCell>
                      <TableCell className="text-sm tabular-nums">{formatDate(r.submittedDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} label={STATUS_LABEL[r.status] ?? humanize(r.status)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openReview(r)}>
                          <Eye className="h-3.5 w-3.5" />
                          {r.status === 'pending' || r.status === 'under_review' ? 'Review' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-border md:hidden">
              {visible.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {humanize(r.type)} · {humanize(r.priority)} · {r.submittedByName || r.submittedByEmail}
                    </p>
                    <div className="mt-1.5">
                      <StatusBadge status={r.status} label={STATUS_LABEL[r.status] ?? humanize(r.status)} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => openReview(r)}>
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminPanel>

      <Dialog open={reviewing !== null} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent className="max-w-2xl">
          {reviewing && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={reviewing.status} label={STATUS_LABEL[reviewing.status] ?? humanize(reviewing.status)} />
                  <span className="text-xs text-muted-foreground">
                    {humanize(reviewing.type)} · {humanize(reviewing.priority)} priority
                  </span>
                </div>
                <DialogTitle className="font-headline text-2xl">{reviewing.title}</DialogTitle>
                <DialogDescription>
                  From {reviewing.submittedByName || reviewing.submittedByEmail} · {formatDate(reviewing.submittedDate, { dateStyle: 'medium', timeStyle: 'short' })}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border border-border bg-secondary/40 p-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Needed by</dt>
                  <dd className="mt-0.5 tabular-nums">{formatDate(reviewing.requestedDate)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Budget</dt>
                  <dd className="mt-0.5 tabular-nums">{formatBudget(reviewing.budget)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contact</dt>
                  <dd className="mt-0.5 truncate">
                    <a href={`mailto:${reviewing.submittedByEmail}`} className="hover:underline underline-offset-4">
                      {reviewing.submittedByEmail}
                    </a>
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Description</p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{reviewing.description}</p>
              </div>

              {reviewing.reviewedByName && (
                <p className="text-xs text-muted-foreground">
                  Last reviewed by {reviewing.reviewedByName}
                  {reviewing.reviewedDate ? ` on ${formatDate(reviewing.reviewedDate)}` : ''}.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="review-notes">Note to the member (optional)</Label>
                <Textarea
                  id="review-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why it was approved or denied, next steps, who to contact."
                  rows={3}
                  maxLength={5000}
                />
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="ghost"
                  disabled={updating || reviewing.status === 'under_review'}
                  onClick={() => decide('under_review')}
                >
                  Mark under review
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={updating} onClick={() => decide('denied')}>
                    <X className="h-4 w-4" /> Deny
                  </Button>
                  <Button className="bg-ink text-ivory hover:bg-ink/90" disabled={updating} onClick={() => decide('approved')}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
