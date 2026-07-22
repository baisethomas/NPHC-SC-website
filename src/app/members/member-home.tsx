'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentActivities, useUnreadMessageCount } from "@/hooks/useMembers";
import type { Announcement, Event } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Bell,
  Calendar,
  FileText,
  LoaderCircle,
  MessageSquare,
  Newspaper,
  Send,
  Users,
} from "lucide-react";

function formatEventDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { month: "—", day: "—" };
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
  };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { dateStyle: "medium" });
}

const QUICK_LINKS = [
  { href: "/members/documents", label: "Documents", icon: FileText },
  { href: "/members/meeting-notes", label: "Meeting Notes", icon: FileText },
  { href: "/members/directory", label: "Member Directory", icon: Users },
  { href: "/members/requests", label: "Submit a Request", icon: Send },
];

export function MemberHome({
  announcements,
  upcomingEvents,
}: {
  announcements: Announcement[];
  upcomingEvents: Event[];
}) {
  const { user } = useAuth();
  const { activities, loading: activitiesLoading } = useRecentActivities(5);
  const { count: unreadCount } = useUnreadMessageCount();

  const firstName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 px-6 py-8 text-white sm:px-8">
        <div className="relative z-10">
          <h1 className="font-headline text-2xl font-bold sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Your hub for council news, events, and member resources.
          </p>
          {unreadCount > 0 && (
            <Button asChild size="sm" variant="secondary" className="mt-4">
              <Link href="/members/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
              </Link>
            </Button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main feed */}
        <div className="space-y-6 lg:col-span-2">
          {/* Announcements */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Latest announcements
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-slate-500">
                <Link href="/news">
                  View all
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
                  {announcements.map((announcement) => (
                    <li key={announcement.id} className="py-4 first:pt-0 last:pb-0">
                      <p className="text-xs text-slate-400">{formatDate(announcement.date)}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">
                        {announcement.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {announcement.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Recent activity
              </CardTitle>
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
          {/* Upcoming events */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Upcoming events
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-slate-500">
                <Link href="/events">
                  All events
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">Nothing scheduled right now.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const { month, day } = formatEventDate(event.date);
                    return (
                      <li key={event.id}>
                        <Link
                          href={`/events`}
                          className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
                        >
                          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-900 text-white">
                            <span className="text-[10px] font-semibold uppercase leading-none text-yellow-400">
                              {month}
                            </span>
                            <span className="mt-0.5 text-base font-bold leading-none">{day}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {event.title}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {event.time}
                              {event.location ? ` · ${event.location}` : ""}
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

          {/* Quick links */}
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
                {unreadCount === 0 && (
                  <li>
                    <Link
                      href="/members/messages"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <MessageSquare className="h-4 w-4" />
                      </span>
                      Messages
                      <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
                    </Link>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
