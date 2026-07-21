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
import { Download, Loader2, Terminal, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getMailingListSubscribers,
  unsubscribeMailingListSubscriber,
  type MailingListSubscriber,
} from './actions';

function formatDate(isoDate: string): string {
  if (!isoDate) return 'Unknown';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-US', { dateStyle: 'medium' });
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function AdminMailingListPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<MailingListSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unsubscribeTarget, setUnsubscribeTarget] = useState<MailingListSubscriber | null>(null);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    const { subscribers: fetched, error } = await getMailingListSubscribers();
    setSubscribers(fetched);
    setLoadError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSubscribers();
  }, [loadSubscribers]);

  const activeCount = subscribers.filter((subscriber) => subscriber.active).length;

  const handleExportCsv = () => {
    const header = ['Email', 'Name', 'Subscribed At', 'Active'];
    const rows = subscribers.map((subscriber) => [
      escapeCsvField(subscriber.email),
      escapeCsvField(subscriber.name ?? ''),
      escapeCsvField(subscriber.subscribedAt),
      subscriber.active ? 'yes' : 'no',
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute(
      'download',
      `mailing_list_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    linkElement.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `${subscribers.length} subscribers exported.`,
    });
  };

  const handleUnsubscribe = async () => {
    if (!unsubscribeTarget) return;
    setIsUnsubscribing(true);
    const result = await unsubscribeMailingListSubscriber(unsubscribeTarget.id);
    if (result.success) {
      setSubscribers((prev) =>
        prev.map((item) =>
          item.id === unsubscribeTarget.id ? { ...item, active: false } : item
        )
      );
      toast({
        title: 'Unsubscribed',
        description: `${unsubscribeTarget.email} has been unsubscribed.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsubscribe Failed',
        description: result.error ?? 'Something went wrong. Please try again.',
      });
    }
    setIsUnsubscribing(false);
    setUnsubscribeTarget(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mailing List</CardTitle>
          <CardDescription>
            {activeCount} active subscriber{activeCount === 1 ? '' : 's'} of {subscribers.length} total.
          </CardDescription>
        </div>
        <Button variant="outline" onClick={handleExportCsv} disabled={loading || subscribers.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
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
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 && !loadError ? (
          <div className="text-center py-12 text-muted-foreground">
            No mailing list subscribers yet.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(subscriber.subscribedAt)}
                      </TableCell>
                      <TableCell>
                        {subscriber.active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Unsubscribed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {subscriber.active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUnsubscribeTarget(subscriber)}
                            disabled={isUnsubscribing}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Unsubscribe
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold leading-tight break-all">{subscriber.email}</div>
                      {subscriber.name && (
                        <div className="text-sm text-muted-foreground">{subscriber.name}</div>
                      )}
                    </div>
                    {subscriber.active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Unsubscribed</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Subscribed {formatDate(subscriber.subscribedAt)}
                  </div>
                  {subscriber.active && (
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUnsubscribeTarget(subscriber)}
                        disabled={isUnsubscribing}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Unsubscribe
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {/* Unsubscribe Confirmation Dialog */}
      <AlertDialog
        open={unsubscribeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUnsubscribeTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsubscribe this address?</AlertDialogTitle>
            <AlertDialogDescription>
              {unsubscribeTarget?.email ?? 'This subscriber'} will stop receiving mailing list
              communications. They can re-subscribe at any time through the public form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
