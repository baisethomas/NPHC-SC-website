'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { CheckCircle2, Loader2, Terminal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  deleteContactSubmission,
  getContactSubmissions,
  markContactSubmissionHandled,
  type ContactSubmission,
} from './actions';

function formatDate(isoDate: string): string {
  if (!isoDate) return 'Unknown';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function StatusBadge({ status }: { status: ContactSubmission['status'] }) {
  if (status === 'new') {
    return <Badge variant="default">New</Badge>;
  }
  return <Badge variant="secondary">Handled</Badge>;
}

export default function AdminInboxPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    const { submissions: fetched, error } = await getContactSubmissions();
    setSubmissions(fetched);
    setLoadError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const newCount = submissions.filter((submission) => submission.status === 'new').length;

  const handleMarkHandled = async (submission: ContactSubmission) => {
    setPendingId(submission.id);
    const result = await markContactSubmissionHandled(submission.id);
    if (result.success) {
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id ? { ...item, status: 'handled' } : item
        )
      );
      toast({
        title: 'Marked as Handled',
        description: `The message from ${submission.name} is now handled.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.error ?? 'Something went wrong. Please try again.',
      });
    }
    setPendingId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteContactSubmission(deleteTarget.id);
    if (result.success) {
      setSubmissions((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast({
        title: 'Message Deleted',
        description: `The message from ${deleteTarget.name} has been deleted.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: result.error ?? 'Something went wrong. Please try again.',
      });
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const renderActions = (submission: ContactSubmission) => (
    <div className="flex justify-end gap-2">
      {submission.status === 'new' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleMarkHandled(submission)}
          disabled={pendingId === submission.id}
        >
          {pendingId === submission.id ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Mark Handled
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteTarget(submission)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Messages submitted through the public contact form.</CardDescription>
        </div>
        <Badge variant={newCount > 0 ? 'default' : 'secondary'}>
          {newCount} New
        </Badge>
      </CardHeader>
      <CardContent>
        {loadError && (
          <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading messages...
          </div>
        ) : submissions.length === 0 && !loadError ? (
          <div className="text-center py-12 text-muted-foreground">
            No contact messages yet.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        <div>{submission.name}</div>
                        <div className="text-sm text-muted-foreground">{submission.email}</div>
                      </TableCell>
                      <TableCell>{submission.subject || '—'}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="whitespace-pre-wrap break-words line-clamp-3">
                          {submission.message}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(submission.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={submission.status} />
                      </TableCell>
                      <TableCell className="text-right">{renderActions(submission)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {submissions.map((submission) => (
                <div key={submission.id} className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold leading-tight">{submission.name}</div>
                      <div className="text-sm text-muted-foreground">{submission.email}</div>
                    </div>
                    <StatusBadge status={submission.status} />
                  </div>
                  {submission.subject && (
                    <div className="text-sm font-medium">{submission.subject}</div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{submission.message}</p>
                  <div className="text-sm text-gray-500">{formatDate(submission.submittedAt)}</div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    {renderActions(submission)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message from {deleteTarget?.name ?? 'this sender'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
