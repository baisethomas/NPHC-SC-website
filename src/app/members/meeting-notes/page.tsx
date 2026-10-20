'use client';

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateBlock, PortalPageHeader, PortalTag } from "@/components/portal/page-header";

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  type: 'regular' | 'special' | 'executive';
  status: 'draft' | 'approved' | 'archived';
  description: string;
  attachments?: string[];
}

const TYPE_LABEL: Record<MeetingNote["type"], string> = {
  regular: "General body",
  special: "Special meeting",
  executive: "Executive committee",
};

export default function MeetingNotesPage() {
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
        <p className="text-muted-foreground">You must be logged in to access meeting notes.</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const meetingNotes: MeetingNote[] = [
    {
      id: '1',
      title: 'January 2025 General Meeting',
      date: '2025-01-15',
      type: 'regular',
      status: 'approved',
      description: 'Monthly general meeting covering budget review, upcoming events, and member updates.',
      attachments: ['meeting-minutes.pdf', 'budget-report.pdf']
    },
    {
      id: '2',
      title: 'Special Event Planning Session',
      date: '2025-01-08',
      type: 'special',
      status: 'approved',
      description: 'Planning session for the upcoming Unity Gala and community service initiatives.',
      attachments: ['event-proposal.pdf']
    },
    {
      id: '3',
      title: 'Executive Committee Meeting',
      date: '2025-01-03',
      type: 'executive',
      status: 'approved',
      description: 'Executive leadership meeting to discuss strategic planning and member concerns.',
      attachments: ['executive-summary.pdf']
    },
    {
      id: '4',
      title: 'December 2024 General Meeting',
      date: '2024-12-18',
      type: 'regular',
      status: 'archived',
      description: 'Year-end meeting with officer elections and annual report presentations.',
      attachments: ['annual-report.pdf', 'election-results.pdf']
    }
  ];

  const statusTone = (status: MeetingNote["status"]) =>
    status === "approved" ? "success" : status === "draft" ? "gold" : "muted";

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Meeting notes"
        description="Minutes and agendas from council meetings, most recent first. Executive committee notes are listed separately when you have access."
      />

      <ol className="divide-y divide-border border-y border-border">
        {meetingNotes.map((note) => (
          <li key={note.id} className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-6">
            <DateBlock date={note.date} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <PortalTag tone={note.type === "executive" ? "ink" : "muted"}>{TYPE_LABEL[note.type]}</PortalTag>
                <PortalTag tone={statusTone(note.status)}>{note.status}</PortalTag>
              </div>
              <h2 className="mt-2 font-headline text-xl font-bold leading-snug md:text-2xl">{note.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(note.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/85">{note.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" className="bg-ink text-ivory hover:bg-ink/90">
                  Read minutes
                </Button>
                {note.attachments?.map((attachment, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // This would typically download the file
                      console.log(`Downloading ${attachment}`);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {attachment}
                  </Button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-sm text-muted-foreground">
        Looking for older minutes or having trouble opening a file? Contact the council secretary or use the contact form.
      </p>
    </div>
  );
}
