'use client';

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, Download, Calendar, FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  type: 'regular' | 'special' | 'executive';
  status: 'draft' | 'approved' | 'archived';
  description: string;
  attachments?: string[];
}

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
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/members">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members Portal
          </Link>
        </Button>
        <p className="text-muted-foreground">Access meeting minutes, agendas, and important announcements.</p>
      </div>

        <div className="grid gap-6">
          {meetingNotes.map((note) => (
            <Card key={note.id} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">{note.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    <CardDescription>{note.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getTypeColor(note.type)}>
                      {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(note.status)}>
                      {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {note.attachments && note.attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Attachments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {note.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              // This would typically download the file
                              console.log(`Downloading ${attachment}`);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {attachment}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Meeting ID: {note.id}
                    </span>
                    <Button variant="default" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Need Help?</h3>
          <p className="text-yellow-700 text-sm">
            If you&apos;re having trouble accessing meeting notes or need older documents, please contact the council secretary or reach out through our contact form.
          </p>
        </div>
    </div>
  );
}
