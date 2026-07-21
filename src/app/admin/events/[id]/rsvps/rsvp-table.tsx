"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import type { EventRSVP } from "@/lib/definitions";

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function RsvpTable({ rsvps, eventTitle, error }: { rsvps: EventRSVP[]; eventTitle: string; error?: string | null }) {
  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Guest Count', 'RSVP Date'];
    const csvContent = [
      headers.join(','),
      ...rsvps.map(rsvp => [
        escapeCsvField(rsvp.name),
        escapeCsvField(rsvp.email),
        escapeCsvField(rsvp.phone || ''),
        escapeCsvField(rsvp.guestCount),
        escapeCsvField(new Date(rsvp.timestamp).toLocaleDateString())
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle}-rsvps.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>RSVP List</CardTitle>
          <CardDescription>People who have RSVP&apos;d for this event</CardDescription>
        </div>
        {rsvps.length > 0 && (
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 mb-4">Error loading RSVPs: {error}</div>
        )}

        {rsvps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No RSVPs yet for this event.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>RSVP Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.map((rsvp) => (
                <TableRow key={rsvp.id}>
                  <TableCell className="font-medium">{rsvp.name}</TableCell>
                  <TableCell>{rsvp.email}</TableCell>
                  <TableCell>{rsvp.phone || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {rsvp.guestCount} {rsvp.guestCount === 1 ? 'person' : 'people'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(rsvp.timestamp).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
