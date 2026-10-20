'use client';

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Message } from "@/types/members";
import { PortalEmpty, PortalPageHeader, PortalSectionTitle, PortalTag } from "@/components/portal/page-header";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<Message["category"], string> = {
  announcement: "Announcement",
  reminder: "Reminder",
  urgent: "Urgent",
  general: "General",
};

function categoryTone(category: Message["category"]) {
  return category === "urgent" ? "danger" : category === "reminder" ? "gold" : category === "announcement" ? "ink" : "muted";
}

function MessageRow({ message }: { message: Message }) {
  const unread = !message.readBy.length;
  return (
    <li className={cn("grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:gap-6", unread && "bg-gold-soft/40 -mx-4 px-4 sm:-mx-6 sm:px-6")}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <PortalTag tone={categoryTone(message.category)}>{CATEGORY_LABEL[message.category]}</PortalTag>
          {message.priority === "high" && <PortalTag tone="danger">High priority</PortalTag>}
          {message.pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">
              <Pin className="h-3 w-3" aria-hidden /> Pinned
            </span>
          )}
          {unread && <span className="h-2 w-2 rounded-full bg-gold" aria-label="Unread" />}
        </div>
        <h3 className={cn("mt-2 font-headline text-xl leading-snug", unread ? "font-bold" : "font-semibold")}>{message.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {message.senderName} · {message.senderRole} · {new Date(message.timestamp).toLocaleString()}
        </p>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">{message.content}</p>
      </div>
      <div className="flex items-start sm:justify-end">
        <Button variant="outline" size="sm" disabled={!unread}>
          {unread ? "Mark as read" : "Read"}
        </Button>
      </div>
    </li>
  );
}

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2 text-center">
        <h1 className="font-headline text-2xl font-bold">Access denied</h1>
        <p className="text-muted-foreground">You must be logged in to view messages.</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const messages = [
    {
      id: '1',
      title: 'Unity Gala 2025 - Action Required',
      content: 'All chapter representatives are required to submit their member attendance counts by January 31st. Please use the attached form and submit via email to the events committee.',
      senderId: 'user1',
      senderName: 'Sarah Johnson',
      senderRole: 'Events Committee Chair',
      timestamp: '2025-01-20T10:30:00',
      category: 'urgent' as const,
      priority: 'high' as const,
      pinned: true,
      readBy: [],
      targetAudience: 'all' as const,
      isActive: true
    },
    {
      id: '2',
      title: 'Monthly Meeting Reminder',
      content: 'This is a reminder that our monthly council meeting is scheduled for February 1st at 7:00 PM. The meeting will be held at the Solano Community Center. Please review the agenda attached to this message.',
      senderId: 'user2',
      senderName: 'Michael Davis',
      senderRole: 'Secretary',
      timestamp: '2025-01-18T14:15:00',
      category: 'reminder',
      priority: 'medium',
      pinned: false,
      readBy: [{userId: 'test', readAt: '2025-01-19T14:15:00'}],
      targetAudience: 'all',
      isActive: true
    },
    {
      id: '3',
      title: 'New Member Orientation Schedule',
      content: 'The orientation schedule for new members has been finalized. Sessions will be held on January 25th and 26th. Please coordinate with your chapter presidents to ensure new members are informed.',
      senderId: 'user3',
      senderName: 'Dr. Angela Williams',
      senderRole: 'President',
      timestamp: '2025-01-15T09:00:00',
      category: 'announcement',
      priority: 'medium',
      pinned: false,
      readBy: [{userId: 'test', readAt: '2025-01-19T14:15:00'}],
      targetAudience: 'all',
      isActive: true
    },
    {
      id: '4',
      title: 'Budget Review Meeting Results',
      content: 'Thank you to all who attended the budget review meeting. The proposed budget for 2025 has been approved with minor modifications. Full details are available in the meeting notes section.',
      senderId: 'user4',
      senderName: 'Robert Chen',
      senderRole: 'Treasurer',
      timestamp: '2025-01-12T16:45:00',
      category: 'general',
      priority: 'low',
      pinned: false,
      readBy: [{userId: 'test', readAt: '2025-01-19T14:15:00'}],
      targetAudience: 'all',
      isActive: true
    },
    {
      id: '5',
      title: 'Emergency Contact Information Update',
      content: 'Please update your emergency contact information in the member portal by January 30th. This is required for all active members and is used for safety purposes during events.',
      senderId: 'user5',
      senderName: 'Lisa Martinez',
      senderRole: 'Membership Chair',
      timestamp: '2025-01-10T11:20:00',
      category: 'urgent',
      priority: 'high',
      pinned: true,
      readBy: [],
      targetAudience: 'all',
      isActive: true
    }
  ] satisfies Message[];

  const pinnedMessages = messages.filter(msg => msg.pinned);
  const unreadCount = messages.filter(msg => !msg.readBy.length).length;
  const categories = Object.keys(CATEGORY_LABEL) as Message["category"][];

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Messages"
        description="Internal communications from officers and committees."
        action={unreadCount > 0 ? <PortalTag tone="gold">{unreadCount} unread</PortalTag> : undefined}
      />

      {pinnedMessages.length > 0 && (
        <section>
          <PortalSectionTitle title="Pinned" count={pinnedMessages.length} />
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {pinnedMessages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </ul>
        </section>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
          <TabsTrigger value="all" className="rounded-full border border-border px-3 py-1 text-xs data-[state=active]:border-ink data-[state=active]:bg-ink data-[state=active]:text-ivory">
            All
          </TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c} value={c} className="rounded-full border border-border px-3 py-1 text-xs data-[state=active]:border-ink data-[state=active]:bg-ink data-[state=active]:text-ivory">
              {CATEGORY_LABEL[c]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <ul className="divide-y divide-border border-y border-border">
            {messages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </ul>
        </TabsContent>

        {categories.map((category) => {
          const inCategory = messages.filter((msg) => msg.category === category);
          return (
            <TabsContent key={category} value={category}>
              {inCategory.length === 0 ? (
                <PortalEmpty title={`No ${CATEGORY_LABEL[category].toLowerCase()} messages`} />
              ) : (
                <ul className="divide-y divide-border border-y border-border">
                  {inCategory.map((message) => (
                    <MessageRow key={message.id} message={message} />
                  ))}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <p className="border-t border-border pt-6 text-sm text-muted-foreground">
        Pinned messages need your attention. You will also get an email for anything marked urgent.
      </p>
    </div>
  );
}
