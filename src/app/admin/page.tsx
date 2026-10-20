import Link from "next/link";
import { ArrowRight, CalendarPlus, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvents, getAnnouncements } from "@/lib/data";
import { getMembers } from "./members/actions";
import { getContactSubmissions } from "./inbox/actions";
import { requestService } from "@/lib/firestore-admin";
import type { Request as MemberRequest } from "@/types/members";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page-header";

async function getPendingRequests(): Promise<MemberRequest[]> {
  try {
    const page = await requestService.getAll({ status: "pending", limit: 50 });
    return page.items;
  } catch (error) {
    console.error("Failed to load pending requests:", error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const [events, { announcements }, { members }, { submissions }, pendingRequests] = await Promise.all([
    getEvents(true),
    getAnnouncements(true),
    getMembers(),
    getContactSubmissions(),
    getPendingRequests(),
  ]);

  const pendingMembers = members.filter((m) => m.membershipStatus === "pending");
  const newSubmissions = submissions.filter((s) => s.status === "new");
  const now = new Date();
  const upcomingEvents = events
    .filter((e) => {
      const date = new Date(e.date);
      return !Number.isNaN(date.getTime()) && date >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const draftEvents = events.filter((e) => e.status === "draft");
  const draftAnnouncements = announcements.filter((a) => a.status === "draft");

  const attention: { key: string; title: string; detail: string; href: string; cta: string }[] = [
    ...pendingMembers.slice(0, 5).map((m) => ({
      key: `member-${m.id}`,
      title: m.displayName || m.email,
      detail: "New member waiting for approval",
      href: "/admin/members",
      cta: "Review",
    })),
    ...pendingRequests.slice(0, 5).map((r) => ({
      key: `request-${r.id}`,
      title: r.title,
      detail: `${r.type.replace(/_/g, " ")} request from ${r.submittedByName || r.submittedByEmail}${r.priority === "high" ? " · High priority" : ""}`,
      href: "/admin/requests",
      cta: "Review",
    })),
    ...newSubmissions.slice(0, 5).map((s) => ({
      key: `inbox-${s.id}`,
      title: s.name ? `${s.name} · ${s.subject || "Contact form"}` : s.subject || "Contact form",
      detail: "Unread contact submission",
      href: "/admin/inbox",
      cta: "Open",
    })),
    ...upcomingEvents
      .filter((e) => e.eventType === "internal" && e.rsvpEnabled)
      .slice(0, 3)
      .map((e) => ({
        key: `rsvp-${e.id}`,
        title: e.title,
        detail: `${e.currentAttendees || 0}${e.maxAttendees ? ` of ${e.maxAttendees}` : ""} RSVPs · ${e.date}`,
        href: `/admin/events/${e.id}/rsvps`,
        cta: "RSVPs",
      })),
  ];

  const counts = [
    { label: "Pending members", value: pendingMembers.length, href: "/admin/members", attention: pendingMembers.length > 0 },
    { label: "Open requests", value: pendingRequests.length, href: "/admin/requests", attention: pendingRequests.length > 0 },
    { label: "Unread inbox", value: newSubmissions.length, href: "/admin/inbox", attention: newSubmissions.length > 0 },
    { label: "Upcoming events", value: upcomingEvents.length, href: "/admin/events", attention: false },
    { label: "Drafts", value: draftEvents.length + draftAnnouncements.length, href: "/admin/announcements", attention: false },
  ];

  const shortcuts = [
    { label: "Add an event", href: "/admin/events/new" },
    { label: "Post an announcement", href: "/admin/announcements/new" },
    { label: "Add a program", href: "/admin/programs/new" },
    { label: "Edit homepage and about copy", href: "/admin/content" },
    { label: "Update contact and social links", href: "/admin/settings" },
    { label: "Upload a member document", href: "/admin/documents" },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="What needs a decision today, and the shortcuts you use most."
        action={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/announcements/new">
                <Newspaper className="h-4 w-4" />
                Post announcement
              </Link>
            </Button>
            <Button asChild className="bg-ink text-ivory hover:bg-ink/90">
              <Link href="/admin/events/new">
                <CalendarPlus className="h-4 w-4" />
                Add event
              </Link>
            </Button>
          </>
        }
      />

      <dl className="grid grid-cols-2 divide-x divide-border rounded-lg border border-border bg-card md:grid-cols-5">
        {counts.map((c) => (
          <Link key={c.label} href={c.href} className="group px-5 py-4 transition-colors hover:bg-secondary/50">
            <dd className="flex items-center gap-2 font-headline text-3xl font-bold leading-none tabular-nums">
              {c.value}
              {c.attention && <span className="h-2 w-2 rounded-full bg-gold" aria-hidden />}
            </dd>
            <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground group-hover:text-foreground">
              {c.label}
            </dt>
          </Link>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-12">
        <AdminPanel
          className="lg:col-span-8"
          title="Needs attention"
          description={attention.length === 0 ? "Nothing waiting on you." : `${attention.length} item${attention.length === 1 ? "" : "s"}`}
        >
          {attention.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No pending approvals, open requests, unread messages, or open RSVP lists.</p>
          ) : (
            <ul className="divide-y divide-border">
              {attention.map((item) => (
                <li key={item.key} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link href={item.href}>
                      {item.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel className="lg:col-span-4" title="Shortcuts">
          <ul className="divide-y divide-border">
            {shortcuts.map((s) => (
              <li key={s.href + s.label}>
                <Link href={s.href} className="group flex items-center justify-between gap-3 py-2.5 text-sm font-medium first:pt-0 last:pb-0 hover:text-foreground">
                  {s.label}
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
            {announcements.length} announcement{announcements.length === 1 ? "" : "s"} and {events.length} event{events.length === 1 ? "" : "s"} on the site.
          </p>
        </AdminPanel>
      </div>
    </div>
  );
}
