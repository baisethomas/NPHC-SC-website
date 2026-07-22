import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  Inbox,
  Newspaper,
  UserCheck,
  Users,
  CheckCircle2,
  Building2,
  GraduationCap,
  PenSquare,
} from "lucide-react";
import { getEvents, getAnnouncements } from "@/lib/data";
import { getMembers } from "./members/actions";
import { getContactSubmissions } from "./inbox/actions";

export default async function AdminDashboardPage() {
  const [events, { announcements }, { members }, { submissions }] = await Promise.all([
    getEvents(true),
    getAnnouncements(true),
    getMembers(),
    getContactSubmissions(),
  ]);

  const pendingMembers = members.filter((m) => m.membershipStatus === "pending");
  const newSubmissions = submissions.filter((s) => s.status === "new");
  const now = new Date();
  const upcomingEvents = events.filter((e) => {
    const date = new Date(e.date);
    return !Number.isNaN(date.getTime()) && date >= now;
  });

  const stats = [
    {
      label: "Members",
      value: members.length,
      hint: "Registered accounts",
      icon: Users,
      href: "/admin/members",
    },
    {
      label: "Pending approvals",
      value: pendingMembers.length,
      hint: pendingMembers.length > 0 ? "Waiting on review" : "All reviewed",
      icon: UserCheck,
      href: "/admin/members",
      attention: pendingMembers.length > 0,
    },
    {
      label: "Upcoming events",
      value: upcomingEvents.length,
      hint: `${events.length} total on the site`,
      icon: Calendar,
      href: "/admin/events",
    },
    {
      label: "New inbox messages",
      value: newSubmissions.length,
      hint: newSubmissions.length > 0 ? "Unhandled submissions" : "Inbox clear",
      icon: Inbox,
      href: "/admin/inbox",
      attention: newSubmissions.length > 0,
    },
  ];

  const quickActions = [
    { label: "Add an event", href: "/admin/events/new", icon: CalendarPlus },
    { label: "Post an announcement", href: "/admin/announcements/new", icon: Newspaper },
    { label: "Edit page content", href: "/admin/content", icon: PenSquare },
    { label: "Manage organizations", href: "/admin/organizations", icon: Building2 },
    { label: "Manage programs", href: "/admin/programs", icon: GraduationCap },
  ];

  const needsAttention = [
    ...pendingMembers.slice(0, 5).map((m) => ({
      key: `member-${m.id}`,
      title: m.displayName || m.email,
      detail: "New member awaiting approval",
      href: "/admin/members",
      cta: "Review",
    })),
    ...newSubmissions.slice(0, 5).map((s) => ({
      key: `inbox-${s.id}`,
      title: s.name ? `${s.name} — ${s.subject || "Contact form"}` : s.subject || "Contact form",
      detail: "Unread contact submission",
      href: "/admin/inbox",
      cta: "Open",
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Greeting + primary actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening across the council site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/announcements/new">
              <Newspaper className="mr-2 h-4 w-4" />
              Post announcement
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800">
            <Link href="/admin/events/new">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add event
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="border-slate-200 shadow-none transition-colors group-hover:border-slate-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        stat.attention ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Needs attention */}
        <Card className="border-slate-200 shadow-none lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Needs attention
              </CardTitle>
              {needsAttention.length > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {needsAttention.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {needsAttention.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="mt-3 text-sm font-medium text-slate-900">All caught up</p>
                <p className="mt-1 text-xs text-slate-500">
                  No pending approvals or unread messages.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {needsAttention.map((item) => (
                  <li key={item.key} className="flex items-center gap-3 py-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={item.href}>
                        {item.cta}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <li key={action.href + action.label}>
                    <Link
                      href={action.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon className="h-4 w-4" />
                      </span>
                      {action.label}
                      <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              {announcements.length} announcements published on the public site.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
