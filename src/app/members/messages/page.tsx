
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoaderCircle, ArrowLeft, MessageSquare, Pin, Bell, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Message } from "@/types/members";


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
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to view messages.</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const messages: Message[] = [
    {
      id: '1',
      title: 'Unity Gala 2025 - Action Required',
      content: 'All chapter representatives are required to submit their member attendance counts by January 31st. Please use the attached form and submit via email to the events committee.',
      senderId: 'user1',
      senderName: 'Sarah Johnson',
      senderRole: 'Events Committee Chair',
      timestamp: '2025-01-20T10:30:00',
      category: 'urgent',
      priority: 'high',
      pinned: true,
      readBy: [],
      targetAudience: 'all'
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
      targetAudience: 'all'
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
      targetAudience: 'all'
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
      targetAudience: 'all'
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
      targetAudience: 'all'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'reminder': return <Calendar className="h-4 w-4" />;
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'general': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pinnedMessages = messages.filter(msg => msg.pinned);
  const unreadCount = messages.filter(msg => !msg.readBy.length).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/members">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Members Portal
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold mb-2">Internal Messages</h1>
              <div className="h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4" />
              <p className="text-muted-foreground">Stay updated with internal communications and announcements.</p>
            </div>
            {unreadCount > 0 && (
              <div className="text-right">
                <Badge variant="destructive" className="text-sm">
                  {unreadCount} Unread
                </Badge>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="announcement">Announcements</TabsTrigger>
            <TabsTrigger value="reminder">Reminders</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Pin className="h-5 w-5 text-yellow-600" />
                Pinned Messages
              </h2>
              {pinnedMessages.map((message) => (
                <Card key={message.id} className="border-l-4 border-l-yellow-500 bg-yellow-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(message.category)}
                          <CardTitle className={`text-lg ${!message.readBy.length ? 'font-bold' : ''}`}>
                            {message.title}
                          </CardTitle>
                          {!message.readBy.length && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span>From: {message.senderName} ({message.senderRole})</span>
                          <span>To: {message.targetAudience}</span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getCategoryColor(message.category)}>
                          {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                        </Badge>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">{message.content}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(message.timestamp).toLocaleString()}</span>
                      <Pin className="h-3 w-3 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* All Messages */}
          <TabsContent value="all" className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${!message.readBy.length ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(message.category)}
                        <CardTitle className={`text-lg ${!message.readBy.length ? 'font-bold' : ''}`}>
                          {message.title}
                        </CardTitle>
                        {!message.readBy.length && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span>From: {message.senderName} ({message.senderRole})</span>
                        <span>To: {message.targetAudience}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getCategoryColor(message.category)}>
                        {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                      </Badge>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">{message.content}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                    <div className="flex gap-2">
                      {message.pinned && <Pin className="h-3 w-3 text-yellow-600" />}
                      <Button variant="outline" size="sm">
                        Mark as Read
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Category-specific tabs */}
          {['announcement', 'reminder', 'urgent', 'general'].map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {messages.filter(msg => msg.category === category).map((message) => (
                <Card key={message.id} className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${!message.readBy.length ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(message.category)}
                          <CardTitle className={`text-lg ${!message.readBy.length ? 'font-bold' : ''}`}>
                            {message.title}
                          </CardTitle>
                          {!message.readBy.length && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span>From: {message.senderName} ({message.senderRole})</span>
                          <span>To: {message.targetAudience}</span>
                        </CardDescription>
                      </div>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">{message.content}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(message.timestamp).toLocaleString()}</span>
                      <div className="flex gap-2">
                        {message.pinned && <Pin className="h-3 w-3 text-yellow-600" />}
                        <Button variant="outline" size="sm">
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Message Center Information</h3>
          <p className="text-green-700 text-sm">
            Messages are organized by category and priority. Pinned messages contain important information that requires immediate attention. 
            You will receive email notifications for urgent messages.
          </p>
        </div>
      </div>
    </div>
  );
}
