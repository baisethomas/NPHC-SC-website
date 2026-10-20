import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/server-auth';
import { getOwnMemberProfile } from '@/lib/member-profile';
import { getDivineNineBrand } from '@/lib/divine-nine-brand';
import { PortalPageHeader, PortalTag } from '@/components/portal/page-header';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, { label: string; tone: 'success' | 'gold' | 'danger' | 'muted' }> = {
  approved: { label: 'Active member', tone: 'success' },
  pending: { label: 'Pending approval', tone: 'gold' },
  suspended: { label: 'Suspended', tone: 'danger' },
  rejected: { label: 'Not approved', tone: 'muted' },
};

export default async function ProfilePage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const profile = await getOwnMemberProfile(session.user.uid);
  const brand = getDivineNineBrand(profile?.organization);
  const status = STATUS_LABEL[profile?.membershipStatus ?? ''] ?? null;
  const joined = profile?.joinedAt ? new Date(profile.joinedAt) : null;
  const displayName = profile?.displayName || session.user.email || 'Member';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8">
      <PortalPageHeader title="My profile" description="What other members see in the directory, and how the council reaches you." />

      {/* Identity */}
      <div className="flex items-center gap-5">
        <div
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-headline text-2xl font-bold text-gold"
          style={brand ? { boxShadow: `0 0 0 4px hsl(var(--background)), 0 0 0 7px ${brand.colors[0]}` } : undefined}
        >
          {profile?.avatarUrl?.startsWith('https://') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials || 'M'
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-headline text-2xl font-bold leading-tight">{displayName}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {brand && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: brand.colors[0] }} aria-hidden />
                {brand.shortName}
                {profile?.chapter ? <span className="font-normal text-muted-foreground">· {profile.chapter}</span> : null}
              </span>
            )}
            {status ? <PortalTag tone={status.tone}>{status.label}</PortalTag> : <PortalTag>Unknown</PortalTag>}
            {profile?.role && <PortalTag tone="ink">{profile.role}</PortalTag>}
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
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
            <p className="text-sm text-muted-foreground">
              We could not find a member record for your account. Contact the council so an admin can link it.
            </p>
          )}
        </div>

        <aside className="lg:col-span-4">
          <dl className="divide-y divide-border border-y border-border text-sm">
            <div className="py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Email</dt>
              <dd className="mt-1 break-all font-medium">{profile?.email ?? session.user.email}</dd>
            </div>
            {joined && !Number.isNaN(joined.getTime()) && (
              <div className="py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Member since</dt>
                <dd className="mt-1 font-medium">{joined.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</dd>
              </div>
            )}
            {brand && (
              <div className="py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Organization</dt>
                <dd className="mt-1 inline-flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: brand.colors[0] }} aria-hidden />
                  {brand.shortName}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Email, status, and roles are managed by the council. Ask an admin to change them.</p>
        </aside>
      </div>
    </div>
  );
}
