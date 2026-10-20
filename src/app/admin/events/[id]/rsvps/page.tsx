import { notFound } from "next/navigation";
import { getEventRSVPs } from "@/app/events/rsvp-actions";
import { getEventBySlug } from "@/lib/data";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page-header";
import { RsvpTable } from "./rsvp-table";

export default async function EventRSVPsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventBySlug(id);
  if (!event) {
    notFound();
  }

  const { rsvps, error } = await getEventRSVPs(event.id);

  const totalAttendees = rsvps.reduce((sum, rsvp) => sum + rsvp.guestCount, 0);
  const capacityPct = event.maxAttendees ? Math.min((totalAttendees / event.maxAttendees) * 100, 100) : null;

  const stats = [
    { label: "RSVPs", value: String(rsvps.length) },
    { label: "Attendees incl. guests", value: String(totalAttendees) },
    { label: "Capacity", value: event.maxAttendees ? `${totalAttendees} / ${event.maxAttendees}` : "No limit" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/admin/events"
        backLabel="Events"
        title="RSVPs"
        description={`${event.title} · ${event.date}${event.time ? ` · ${event.time}` : ""}`}
      />

      <dl className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-card">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <dd className="font-headline text-2xl font-bold leading-none tabular-nums md:text-3xl">{s.value}</dd>
            <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</dt>
            {s.label === "Capacity" && capacityPct !== null && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gold" style={{ width: `${capacityPct}%` }} />
              </div>
            )}
          </div>
        ))}
      </dl>

      <AdminPanel>
        <RsvpTable rsvps={rsvps} eventTitle={event.title} error={error} />
      </AdminPanel>
    </div>
  );
}
