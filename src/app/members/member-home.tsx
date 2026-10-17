'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentActivities, useUnreadMessageCount } from "@/hooks/useMembers";
import type { Announcement, BoardMember, Event, MemberProfile } from "@/lib/definitions";
import type { MeetingNote } from "@/types/members";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { splitDate } from "@/lib/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventSpotlight } from "@/components/site/event-spotlight";
import {
  ArrowRight,
  Bell,
  Calendar,
  CalendarCheck,
  FileText,
  LoaderCircle,
  MessageSquare,
  Newspaper,
  Pencil,
  Send,
  Users,
} from "lucide-react";

function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", opts);
}

const QUICK_LINKS = [
  { href: "/members/documents", label: "Documents", icon: FileText },
  { href: "/members/meeting-notes", label: "Meeting notes", icon: FileText },
  { href: "/members/directory", label: "Member directory", icon: Users },
  { href: "/members/requests", label: "Submit a request", icon: Send },
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

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 font-headline text-2xl font-bold"
            style={{ borderColor: brand?.colors[0] ?? "hsl(var(--brand-gold))" }}
          >
            {profile?.avatarUrl?.startsWith("https://") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-yellow-400">{initials || "M"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-400">Welcome back</p>
            <h1 className="mt-1 font-headline text-2xl font-bold sm:text-3xl">{firstName}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-300">
              {brand ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />
                  {brand.shortName}
                  {profile?.chapter ? ` · ${profile.chapter}` : ""}
                </span>
              ) : (
                <Link href="/members/profile" className="underline underline-offset-4 hover:text-white">
                  Add your organization and chapter
                </Link>
              )}
              {profile?.role && <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/10">{profile.role}</Badge>}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {unreadCount > 0 && (
              <Button asChild size="sm" className="bg-yellow-400 text-slate-900 hover:bg-yellow-300">
                <Link href="/members/messages">
                  <MessageSquare className="h-4 w-4" />
                  {unreadCount} unread
                </Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/members/profile">
                <Pencil className="h-4 w-4" /> Edit profile
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Next meeting */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Next council meeting</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-slate-500">
                <Link href="/members/meeting-notes">
                  Past minutes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {nextMeeting ? (
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-900 text-white">
                    <span className="text-[10px] font-semibold uppercase leading-none text-yellow-400">{formatDate(nextMeeting.date, { month: "short" })}</span>
                    <span className="mt-1 text-lg font-bold leading-none">{formatDate(nextMeeting.date, { day: "numeric" })}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{nextMeeting.title}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(nextMeeting.date, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      {" · "}
                      {nextMeeting.type === "special" ? "Special meeting" : "General body"}
                    </p>
                    {nextMeeting.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{nextMeeting.description}</p>}
                    {nextMeeting.agendaItems && nextMeeting.agendaItems.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-slate-600">
                        {nextMeeting.agendaItems
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .slice(0, 4)
                          .map((item) => (
                            <li key={item.id} className="flex items-start gap-2">
                              <CalendarCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
                              {item.title}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p>
                    No meeting is posted yet.
                    {meetingCadence ? ` ${meetingCadence}` : " Check back soon or ask an officer."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spotlight event */}
          {spotlight && <EventSpotlight event={spotlight} compact />}

          {/* Announcements */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Latest announcements</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-slate-500">
                <Link href="/news">
                  View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Newspaper className="h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">No announcements yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {announcements.map((a) => (
                    <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                      <p className="text-xs text-slate-400">{formatDate(a.date)}</p>
                      <Link href={`/news/${a.id}`} className="mt-0.5 block text-sm font-semibold text-slate-900 hover:underline underline-offset-4">
                        {a.title}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{a.description.replace(/<[^>]+>/g, " ")}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {activitiesLoading ? (
                <div className="flex justify-center py-6">
                  <LoaderCircle className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Bell className="h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">No recent activity.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {activities.map((activity) => (
                    <li key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          activity.type === "document"
                            ? "bg-blue-500"
                            : activity.type === "meeting"
                              ? "bg-emerald-500"
                              : activity.type === "message"
                                ? "bg-amber-500"
                                : activity.type === "request"
                                  ? "bg-violet-500"
                                  : "bg-slate-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.description}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {activity.user} · {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Also coming up</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-slate-500">
                <Link href="/events">
                  All events <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">{spotlight ? "Nothing else scheduled yet." : "Nothing scheduled right now."}</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const { month, day } = splitDate(event);
                    const host = getDivineNineBrand(event.hostOrganization);
                    return (
                      <li key={event.id}>
                        <Link
                          href={`/events/${event.slug}`}
                          className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
                        >
                          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-900 text-white">
                            <span className="text-[10px] font-semibold uppercase leading-none text-yellow-400">{month}</span>
                            <span className="mt-0.5 text-base font-bold leading-none">{day}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{event.title}</p>
                            <p className="truncate text-xs text-slate-500">
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
            </CardContent>
          </Card>

          {officers.length > 0 && (
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">Executive board</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="divide-y divide-slate-100">
                  {officers.map((o) => {
                    const ob = getDivineNineBrand(o.organization);
                    return (
                      <li key={o.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
                          style={ob ? { boxShadow: `inset 0 0 0 2px ${ob.colors[0]}` } : undefined}
                        >
                          {o.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{o.name}</p>
                          <p className="truncate text-xs text-slate-500">
                            {o.title}
                            {ob ? ` · ${ob.shortName}` : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <Icon className="h-4 w-4" />
                        </span>
                        {link.label}
                        <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
