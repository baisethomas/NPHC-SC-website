'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentActivities, useUnreadMessageCount } from "@/hooks/useMembers";
import type { Announcement, BoardMember, Event, MemberProfile } from "@/lib/definitions";
import type { MeetingNote } from "@/types/members";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { splitDate } from "@/lib/events";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventSpotlight } from "@/components/site/event-spotlight";
import { DateBlock, PortalSectionTitle } from "@/components/portal/page-header";
import { ArrowRight, LoaderCircle, MessageSquare, Pencil } from "lucide-react";

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", opts);
}

const QUICK_LINKS = [
  { href: "/members/documents", label: "Documents" },
  { href: "/members/meeting-notes", label: "Meeting notes" },
  { href: "/members/directory", label: "Member directory" },
  { href: "/members/requests", label: "Submit a request" },
  { href: "/members/profile", label: "My profile" },
];

export function MemberHome({
  profile,
  meetingCadence,
  nextMeeting,
  spotlight,
  upcomingEvents,
  announcements,
  officers,
}: {
  profile: MemberProfile | null;
  meetingCadence: string;
  nextMeeting: MeetingNote | null;
  spotlight: Event | null;
  upcomingEvents: Event[];
  announcements: Announcement[];
  officers: BoardMember[];
}) {
  const { user } = useAuth();
  const { activities, loading: activitiesLoading } = useRecentActivities(5);
  const { count: unreadCount } = useUnreadMessageCount();

  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Member";
  const firstName = displayName.split(" ")[0];
  const brand = getDivineNineBrand(profile?.organization);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const agenda = nextMeeting?.agendaItems
    ?.slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Greeting */}
      <section className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-headline text-xl font-bold text-gold ring-4 ring-offset-2 ring-offset-background sm:h-20 sm:w-20"
            style={{ ["--tw-ring-color" as string]: brand?.colors[0] ?? "hsl(var(--brand-gold))" }}
          >
            {profile?.avatarUrl?.startsWith("https://") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials || "M"
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Welcome back</p>
            <h1 className="mt-1 font-headline text-3xl font-bold leading-none sm:text-4xl">{firstName}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {brand ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: brand.colors[0] }} aria-hidden />
                  {brand.shortName}
                  {profile?.chapter ? <span className="font-normal text-muted-foreground">· {profile.chapter}</span> : null}
                </span>
              ) : (
                <Link href="/members/profile" className="underline underline-offset-4 hover:text-foreground">
                  Add your organization and chapter
                </Link>
              )}
              {profile?.role && <span>{profile.role}</span>}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button asChild size="sm" className="bg-gold text-ink hover:bg-gold/90">
              <Link href="/members/messages">
                <MessageSquare className="h-4 w-4" />
                {unreadCount} unread
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <Link href="/members/profile">
              <Pencil className="h-4 w-4" /> Edit profile
            </Link>
          </Button>
        </div>
      </section>

      {/* The next thing */}
      <section className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-10 lg:col-span-8">
          {/* Next council meeting */}
          <div>
            <PortalSectionTitle
              title="Next council meeting"
              action={
                <Link href="/members/meeting-notes" className="text-sm font-semibold hover:underline underline-offset-4">
                  Past minutes <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              }
            />
            {nextMeeting ? (
              <div className="mt-5 flex gap-5 rounded-lg bg-ink p-6 text-ivory">
                <DateBlock date={nextMeeting.date} className="bg-ivory/10" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                    {nextMeeting.type === "special" ? "Special meeting" : "General body"}
                  </p>
                  <p className="mt-1 font-headline text-2xl font-bold leading-tight">{nextMeeting.title}</p>
                  <p className="mt-1.5 text-sm text-ivory/70">
                    {formatDate(nextMeeting.date, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                  {nextMeeting.description && <p className="mt-3 line-clamp-2 text-sm text-ivory/80">{nextMeeting.description}</p>}
                  {agenda && agenda.length > 0 && (
                    <ol className="mt-4 divide-y divide-ivory/10 border-t border-ivory/10">
                      {agenda.map((item, i) => (
                        <li key={item.id} className="flex items-baseline gap-3 py-2 text-sm">
                          <span className="font-headline font-bold tabular-nums text-gold">0{i + 1}</span>
                          <span className="text-ivory/90">{item.title}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No meeting is posted yet.
                {meetingCadence ? ` ${meetingCadence}` : " Check back soon or ask an officer."}
              </p>
            )}
          </div>

          {/* Spotlight event */}
          {spotlight && (
            <div>
              <PortalSectionTitle title="Coming up" />
              <div className="mt-5">
                <EventSpotlight event={spotlight} compact />
              </div>
            </div>
          )}

          {/* Announcements */}
          <div>
            <PortalSectionTitle
              title="Announcements"
              action={
                <Link href="/news" className="text-sm font-semibold hover:underline underline-offset-4">
                  All news <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              }
            />
            {announcements.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Nothing posted yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {announcements.map((a) => (
                  <li key={a.id} className="py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{formatDate(a.date)}</p>
                    <Link href={`/news/${a.id}`} className="mt-1 block font-headline text-lg font-bold leading-snug hover:underline underline-offset-4">
                      {a.title}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description.replace(/<[^>]+>/g, " ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent activity */}
          <div>
            <PortalSectionTitle title="Recent activity" />
            {activitiesLoading ? (
              <div className="flex py-6">
                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-start gap-4 py-3">
                    <span
                      className={cn(
                        "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                        activity.type === "document"
                          ? "bg-gold"
                          : activity.type === "meeting"
                            ? "bg-ink"
                            : activity.type === "message"
                              ? "bg-gold"
                              : activity.type === "request"
                                ? "bg-ink"
                                : "bg-muted-foreground"
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {activity.user} · {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-10 lg:col-span-4">
          <div>
            <PortalSectionTitle
              title="Also coming up"
              action={
                <Link href="/events" className="text-sm font-semibold hover:underline underline-offset-4">
                  All events <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              }
            />
            {upcomingEvents.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{spotlight ? "Nothing else scheduled yet." : "Nothing scheduled right now."}</p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {upcomingEvents.map((event) => {
                  const { month, day } = splitDate(event);
                  const host = getDivineNineBrand(event.hostOrganization);
                  return (
                    <li key={event.id}>
                      <Link href={`/events/${event.slug}`} className="group flex items-center gap-3 py-3">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-ink text-ivory">
                          <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-gold">{month}</span>
                          <span className="mt-0.5 font-headline text-base font-bold leading-none">{day}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold group-hover:underline underline-offset-4">{event.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {host ? `${host.shortName} · ` : ""}
                            {event.time}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {officers.length > 0 && (
            <div>
              <PortalSectionTitle title="Executive board" />
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {officers.map((o) => {
                  const ob = getDivineNineBrand(o.organization);
                  return (
                    <li key={o.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-headline text-xs font-bold text-foreground"
                        style={ob ? { boxShadow: `inset 0 0 0 2px ${ob.colors[0]}` } : undefined}
                      >
                        {o.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{o.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {o.title}
                          {ob ? ` · ${ob.shortName}` : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <PortalSectionTitle title="Quick links" />
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center justify-between py-2.5 text-sm font-semibold">
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
