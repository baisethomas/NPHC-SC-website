import Link from "next/link";
import { PlusCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAnnouncements } from "@/lib/data";
import { AdminPageHeader, AdminPanel, AdminEmpty, AdminCount } from "@/components/admin/admin-page-header";
import { AnnouncementsTable } from "./announcements-table";

export default async function AdminAnnouncementsPage() {
  const { announcements, error } = await getAnnouncements(true); // Include all content in admin
  const drafts = announcements.filter((a) => a.status === "draft").length;

  const createButton = (
    <Button asChild className="bg-ink text-ivory hover:bg-ink/90">
      <Link href="/admin/announcements/new">
        <PlusCircle className="h-4 w-4" />
        Post announcement
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Announcements"
        description="News posts shown on the public site and the member portal."
        meta={
          <>
            <AdminCount>{announcements.length} total</AdminCount>
            {drafts > 0 && <AdminCount attention>{drafts} draft{drafts === 1 ? "" : "s"}</AdminCount>}
          </>
        }
        action={createButton}
      />

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error loading announcements</AlertTitle>
          <AlertDescription>
            There was an issue fetching announcements from the database. Check the server logs and your Firestore security rules.
          </AlertDescription>
        </Alert>
      )}

      {announcements.length === 0 && !error ? (
        <AdminEmpty action={createButton}>No announcements yet. Post the first one and it will show under News.</AdminEmpty>
      ) : (
        <AdminPanel>
          <AnnouncementsTable announcements={announcements} />
        </AdminPanel>
      )}
    </div>
  );
}
