import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/server-auth';
import { getOwnMemberProfile } from '@/lib/member-profile';
import { getDivineNineBrand } from '@/lib/divine-nine-brand';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  approved: { label: 'Active member', className: 'bg-emerald-100 text-emerald-800' },
  pending: { label: 'Pending approval', className: 'bg-amber-100 text-amber-800' },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-800' },
  rejected: { label: 'Not approved', className: 'bg-slate-200 text-slate-700' },
};

export default async function ProfilePage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const profile = await getOwnMemberProfile(session.user.uid);
  const brand = getDivineNineBrand(profile?.organization);
  const status = STATUS_LABEL[profile?.membershipStatus ?? ''] ?? null;
  const joined = profile?.joinedAt ? new Date(profile.joinedAt) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-slate-900">My profile</h1>
        <p className="mt-1 text-sm text-slate-500">What other members see in the directory, and how the council reaches you.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-none lg:col-span-2">
          <CardContent className="p-6">
            {profile ? (
              <ProfileForm
                initial={{
                  displayName: profile.displayName ?? '',
                  organization: brand?.shortName ?? '',
                  chapter: profile.chapter ?? '',
                  phone: profile.phone ?? '',
                  avatarUrl: profile.avatarUrl ?? '',
                  showInDirectory: profile.showInDirectory !== false,
                }}
              />
            ) : (
              <p className="text-sm text-slate-600">
                We could not find a member record for your account. Contact the council so an admin can link it.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-none">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Membership</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {status ? <Badge className={`${status.className} hover:${status.className}`}>{status.label}</Badge> : <Badge variant="secondary">Unknown</Badge>}
                {profile?.role && <Badge variant="outline">{profile.role}</Badge>}
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900 break-all">{profile?.email ?? session.user.email}</dd>
              </div>
              {joined && !Number.isNaN(joined.getTime()) && (
                <div>
                  <dt className="text-slate-500">Member since</dt>
                  <dd className="font-medium text-slate-900">{joined.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</dd>
                </div>
              )}
              {brand && (
                <div>
                  <dt className="text-slate-500">Organization</dt>
                  <dd className="inline-flex items-center gap-2 font-medium text-slate-900">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />
                    {brand.shortName}
                  </dd>
                </div>
              )}
            </dl>
            <p className="border-t border-slate-100 pt-4 text-xs text-slate-500">
              Email, status, and roles are managed by the council. Ask an admin to change them.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
