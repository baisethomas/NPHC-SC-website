import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getEvents } from "@/lib/data";
import { PlusCircle, Trash2, Pencil, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import { deleteEvent } from "./actions";

export default async function AdminEventsPage() {
  const events = await getEvents(true);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Events</CardTitle>
            <CardDescription>Manage your organization&apos;s events.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Event
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
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
                  <TableCell className="font-medium">
                    {event.title}
                    {event.status === 'draft' && (
                      <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-200 bg-yellow-50">Draft</Badge>
                    )}
                  </TableCell>
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
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 mt-4 md:hidden">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden border border-gray-200 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-lg leading-tight">{event.title}</div>
                  {event.status === 'draft' && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 shrink-0">Draft</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant={
                    event.eventType === 'internal' ? 'default' :
                    event.eventType === 'external' ? 'secondary' : 'outline'
                  }>
                    {event.eventType === 'internal' ? 'NPHC' :
                     event.eventType === 'external' ? 'External' : 'Info Only'}
                  </Badge>
                  <div className="text-gray-500 flex items-center">
                    {event.date}
                  </div>
                </div>

                <div className="py-2 border-y border-gray-100 flex items-center mt-1">
                  {event.eventType === 'internal' && event.rsvpEnabled ? (
                    <Button asChild variant="secondary" size="sm" className="w-full h-8">
                      <Link href={`/admin/events/${event.id}/rsvps`}>
                        <Users className="h-4 w-4 mr-2" />
                        RSVPs: {event.currentAttendees || 0}{event.maxAttendees && `/${event.maxAttendees}`}
                      </Link>
                    </Button>
                  ) : event.eventType === 'external' && event.externalLink ? (
                    <Button asChild variant="secondary" size="sm" className="w-full h-8">
                      <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        External Link
                      </a>
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground italic w-full text-center">No registration</div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Pencil className="h-3 w-3 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <form action={deleteEvent} className="inline-block">
                    <input type="hidden" name="id" value={event.id} />
                    <Button variant="destructive" size="sm" type="submit" className="h-8">
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
