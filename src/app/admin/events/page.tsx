import Link from "next/link";
import { ExternalLink, Pencil, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEvents } from "@/lib/data";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { AdminPageHeader, AdminPanel, AdminEmpty, AdminCount } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteEventButton } from "./delete-button";

const TYPE_LABEL = { internal: "NPHC", external: "External", info_only: "Info only" } as const;

export default async function AdminEventsPage() {
  const events = await getEvents(true);
  const drafts = events.filter((e) => e.status === "draft").length;

  const createButton = (
    <Button asChild className="bg-ink text-ivory hover:bg-ink/90">
      <Link href="/admin/events/new">
        <PlusCircle className="h-4 w-4" />
        Add event
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events"
        description="Everything on the public calendar, including drafts and scheduled posts."
        meta={
          <>
            <AdminCount>{events.length} total</AdminCount>
            {drafts > 0 && <AdminCount attention>{drafts} draft{drafts === 1 ? "" : "s"}</AdminCount>}
          </>
        }
        action={createButton}
      />

      {events.length === 0 ? (
        <AdminEmpty action={createButton}>No events yet. Add the first one and it will appear on the public calendar.</AdminEmpty>
      ) : (
        <AdminPanel className="overflow-hidden [&>div]:p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RSVPs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const brand = getDivineNineBrand(event.hostOrganization);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <p className="font-semibold">{event.title}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {brand && <span className="h-2 w-2 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />}
                          {brand?.shortName ?? "Council"}
                          {event.featured ? " · Featured" : ""}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {event.date}
                        {event.time && <span className="block text-xs text-muted-foreground">{event.time}</span>}
                      </TableCell>
                      <TableCell className="text-sm">{TYPE_LABEL[event.eventType] ?? event.eventType}</TableCell>
                      <TableCell>
                        <StatusBadge status={event.status ?? "published"} />
                      </TableCell>
                      <TableCell>
                        {event.eventType === "internal" && event.rsvpEnabled ? (
                          <Button asChild variant="ghost" size="sm" className="-ml-2">
                            <Link href={`/admin/events/${event.id}/rsvps`}>
                              <Users className="h-4 w-4" />
                              {event.currentAttendees || 0}
                              {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                            </Link>
                          </Button>
                        ) : event.eventType === "external" && event.externalLink ? (
                          <Button asChild variant="ghost" size="sm" className="-ml-2">
                            <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
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
                        <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {events.map((event) => (
              <li key={event.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.date}
                      {event.time ? ` · ${event.time}` : ""} · {TYPE_LABEL[event.eventType] ?? event.eventType}
                    </p>
                  </div>
                  <StatusBadge status={event.status ?? "published"} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {event.eventType === "internal" && event.rsvpEnabled && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/events/${event.id}/rsvps`}>
                        <Users className="h-4 w-4" />
                        RSVPs {event.currentAttendees || 0}
                        {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteEventButton eventId={event.id} eventTitle={event.title} variant="full" />
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      )}
    </div>
  );
}
