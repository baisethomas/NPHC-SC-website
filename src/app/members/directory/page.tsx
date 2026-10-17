import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDirectoryMembers } from '@/lib/data';
import { requireActiveMemberSession } from '@/lib/server-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DirectoryBrowser } from './directory-browser';

export default async function MemberDirectoryPage() {
  const auth = await requireActiveMemberSession();
  if (!auth.ok) redirect('/login');

  const { members, error } = await getDirectoryMembers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-slate-900">Member directory</h1>
          <p className="mt-1 text-sm text-slate-500">Officers and members of the NPHC of Solano County. Visible to signed-in members only.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/members/profile">Update my listing</Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 shadow-none">
          <CardContent className="pt-6 text-sm text-red-700">Error loading directory: {error}</CardContent>
        </Card>
      ) : members.length === 0 ? (
        <Card className="border-2 border-dashed shadow-none">
          <CardContent className="py-16 text-center">
            <p className="font-semibold text-slate-900">The directory is empty</p>
            <p className="mt-1 text-sm text-slate-500">Approved members will appear here once their profiles are set up.</p>
          </CardContent>
        </Card>
      ) : (
        <DirectoryBrowser members={members} />
      )}
    </div>
  );
}
