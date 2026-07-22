import { getAnnouncements, getEvents } from "@/lib/data";
import { MemberHome } from "./member-home";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [events, { announcements }] = await Promise.all([getEvents(), getAnnouncements()]);

  const now = new Date();
  const upcomingEvents = events
    .filter((event) => {
      const date = new Date(event.date);
      return !Number.isNaN(date.getTime()) && date >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const latestAnnouncements = announcements.slice(0, 4);

  return <MemberHome announcements={latestAnnouncements} upcomingEvents={upcomingEvents} />;
}
