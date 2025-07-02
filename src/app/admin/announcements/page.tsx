import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAnnouncements } from "@/lib/data";
import { PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Manage your organization's announcements.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Announcement
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell className="font-medium">{announcement.title}</TableCell>
                <TableCell>{announcement.date}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteAnnouncement} className="inline-block">
                    <input type="hidden" name="id" value={announcement.id} />
                    <Button variant="ghost" size="icon" type="submit">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
