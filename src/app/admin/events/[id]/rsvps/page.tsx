import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEventRSVPs } from "@/app/events/rsvp-actions";
import { getEventBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import { RsvpTable } from "./rsvp-table";

export default async function EventRSVPsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventBySlug(id);
  if (!event) {
    notFound();
  }

  const { rsvps, error } = await getEventRSVPs(event.id);

  const totalAttendees = rsvps.reduce((sum, rsvp) => sum + rsvp.guestCount, 0);

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

      <RsvpTable rsvps={rsvps} eventTitle={event.title} error={error} />
    </div>
  );
}
