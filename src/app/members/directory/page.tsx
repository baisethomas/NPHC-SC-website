import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDirectoryMembers } from '@/lib/data';
import { requireActiveMemberSession } from '@/lib/server-auth';
import { Button } from '@/components/ui/button';
import { PortalEmpty, PortalPageHeader } from '@/components/portal/page-header';
import { DirectoryBrowser } from './directory-browser';

export default async function MemberDirectoryPage() {
  const auth = await requireActiveMemberSession();
  if (!auth.ok) redirect('/login');

  const { members, error } = await getDirectoryMembers();

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Member directory"
        description="Officers and members of the NPHC of Solano County. Visible to signed-in members only."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/members/profile">Update my listing</Link>
          </Button>
        }
      />

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Error loading directory: {error}</p>
      ) : members.length === 0 ? (
        <PortalEmpty title="The directory is empty" description="Approved members will appear here once their profiles are set up." />
      ) : (
        <DirectoryBrowser members={members} />
      )}
    </div>
  );
}
