'use client';

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, Users, FileText, MessageSquare, Send, Bell, Calendar, Download, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRecentActivities, useUnreadMessageCount } from "@/hooks/useMembers";
import Link from "next/link";

export default function MembersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { activities, loading: activitiesLoading } = useRecentActivities(5);
  const { count: unreadCount } = useUnreadMessageCount();

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
        <p className="text-muted-foreground">You must be logged in to access the members section.</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold mb-2">Members Portal</h1>
          <div className="h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4" />
          <p className="text-muted-foreground">Welcome, {user.email}. Access your member resources below.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Meeting Notes</CardTitle>
                  <CardDescription>Access notes from recent meetings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and download meeting minutes, agendas, and important announcements from council meetings.
              </p>
              <Button asChild className="w-full">
                <Link href="/members/meeting-notes">
                  View Meeting Notes
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Documents</CardTitle>
                  <CardDescription>Important member documents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access bylaws, constitution, membership guidelines, and other important organizational documents.
              </p>
              <Button asChild className="w-full">
                <Link href="/members/documents">
                  View Documents
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Submit Request</CardTitle>
                  <CardDescription>Submit requests to the council</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Submit event proposals, funding requests, or other formal requests to the council for review.
              </p>
              <Button asChild className="w-full">
                <Link href="/members/requests">
                  Submit Request
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Internal Messages</CardTitle>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Member communications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View internal announcements, updates, and messages from council leadership and other members.
              </p>
              <Button asChild className="w-full">
                <Link href="/members/messages">
                  View Messages
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Latest updates and notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="flex justify-center py-4">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.type === 'document' ? 'bg-blue-500' :
                          activity.type === 'meeting' ? 'bg-green-500' :
                          activity.type === 'message' ? 'bg-orange-500' :
                          activity.type === 'request' ? 'bg-purple-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No recent activity</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}