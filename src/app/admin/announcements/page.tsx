import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnouncements } from "@/lib/data";
import { PlusCircle, Terminal } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnnouncementsTable } from "./announcements-table";

export default async function AdminAnnouncementsPage() {
  const { announcements, error } = await getAnnouncements(true); // Include all content in admin

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Manage your organization&apos;s announcements.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Announcement
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Data</AlertTitle>
                <AlertDescription>
                   There was an issue fetching announcements from the database. Please check the server logs and your Firestore security rules.
                </AlertDescription>
            </Alert>
        )}
        
        <AnnouncementsTable announcements={announcements} />
      </CardContent>
    </Card>
  );
}
