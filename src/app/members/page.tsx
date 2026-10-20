import { redirect } from "next/navigation";
import { getAnnouncements, getBoardMembers, getEvents } from "@/lib/data";
import { requireSession } from "@/lib/server-auth";
import { getOwnMemberProfile } from "@/lib/member-profile";
import { getSiteSettings } from "@/lib/site-settings";
import { meetingService } from "@/lib/firestore-admin";
import { pickSpotlightEvent, upcomingEvents } from "@/lib/events";
import type { MeetingNote } from "@/types/members";
import { MemberHome } from "./member-home";

export const dynamic = "force-dynamic";

async function getNextMeeting(): Promise<MeetingNote | null> {
  try {
    const page = await meetingService.getAll({ status: "approved", dateFrom: new Date().toISOString(), limit: 10 });
    const upcoming = page.items
      .filter((m) => m.type !== "executive")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] ?? null;
  } catch (error) {
    console.error("Failed to load next meeting:", error);
    return null;
  }
}

export default async function MembersPage() {
  const session = await requireSession();
  if (!session.ok) redirect("/login");

  const [profile, settings, events, { announcements }, { boardMembers }, nextMeeting] = await Promise.all([
    getOwnMemberProfile(session.user.uid),
    getSiteSettings(),
    getEvents(),
    getAnnouncements(),
    getBoardMembers(),
    getNextMeeting(),
  ]);

  const spotlight = pickSpotlightEvent(events) ?? null;
  const moreEvents = upcomingEvents(events)
    .filter((e) => e.id !== spotlight?.id)
    .slice(0, 3);

  return (
    <MemberHome
      profile={profile}
      meetingCadence={settings.meetingCadence}
      nextMeeting={nextMeeting}
      spotlight={spotlight}
      upcomingEvents={moreEvents}
      announcements={announcements.slice(0, 4)}
      officers={boardMembers}
    />
  );
}
