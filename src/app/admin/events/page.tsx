import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getEvents } from "@/lib/data";
import { PlusCircle, Trash2, Pencil, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import { deleteEvent } from "./actions";

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Events</CardTitle>
            <CardDescription>Manage your organization's events.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Event
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>RSVPs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>
                  <Badge variant={
                    event.eventType === 'internal' ? 'default' :
                    event.eventType === 'external' ? 'secondary' : 'outline'
                  }>
                    {event.eventType === 'internal' ? 'NPHC' :
                     event.eventType === 'external' ? 'External' : 'Info Only'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.eventType === 'internal' && event.rsvpEnabled ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/events/${event.id}/rsvps`}>
                        <Users className="h-4 w-4 mr-1" />
                        {event.currentAttendees || 0}
                        {event.maxAttendees && `/${event.maxAttendees}`}
                      </Link>
                    </Button>
                  ) : event.eventType === 'external' && event.externalLink ? (
                    <Button asChild variant="ghost" size="sm">
                      <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        External
                      </a>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                   <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                   <form action={deleteEvent} className="inline-block">
                      <input type="hidden" name="id" value={event.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
