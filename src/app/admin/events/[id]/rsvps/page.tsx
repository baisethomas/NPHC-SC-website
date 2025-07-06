import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventRSVPs } from "@/app/events/rsvp-actions";
import { getEventBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Users, Calendar } from "lucide-react";

export default async function EventRSVPsPage({ params }: { params: { id: string } }) {
  const event = await getEventBySlug(params.id);
  if (!event) {
    notFound();
  }

  const { rsvps, error } = await getEventRSVPs(event.id);

  const totalAttendees = rsvps.reduce((sum, rsvp) => sum + rsvp.guestCount, 0);

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Guest Count', 'RSVP Date'];
    const csvContent = [
      headers.join(','),
      ...rsvps.map(rsvp => [
        `"${rsvp.name}"`,
        `"${rsvp.email}"`,
        `"${rsvp.phone || ''}"`,
        rsvp.guestCount,
        `"${new Date(rsvp.timestamp).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}-rsvps.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Event RSVPs</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rsvps.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground">Including guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.maxAttendees ? `${totalAttendees}/${event.maxAttendees}` : '∞'}
            </div>
            {event.maxAttendees && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{width: `${Math.min((totalAttendees / event.maxAttendees) * 100, 100)}%`}}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>RSVP List</CardTitle>
            <CardDescription>People who have RSVP'd for this event</CardDescription>
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
    </div>
  );
}