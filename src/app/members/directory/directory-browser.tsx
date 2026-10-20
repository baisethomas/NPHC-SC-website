'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { MemberProfile } from '@/lib/definitions';
import { getDivineNineBrand } from '@/lib/divine-nine-brand';
import { Input } from '@/components/ui/input';
import { PortalEmpty } from '@/components/portal/page-header';
import { cn } from '@/lib/utils';

const ALL = '__all';

export function DirectoryBrowser({ members }: { members: MemberProfile[] }) {
  const [query, setQuery] = useState('');
  const [org, setOrg] = useState(ALL);

  const orgs = useMemo(() => {
    const seen = new Map<string, { key: string; label: string; color: string; count: number }>();
    for (const m of members) {
      const b = getDivineNineBrand(m.organization);
      if (!b) continue;
      const cur = seen.get(b.key);
      if (cur) cur.count += 1;
      else seen.set(b.key, { key: b.key, label: b.shortName, color: b.colors[0], count: 1 });
    }
    return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [members]);

  const q = query.trim().toLowerCase();
  const shown = members.filter((m) => {
    const b = getDivineNineBrand(m.organization);
    if (org !== ALL && b?.key !== org) return false;
    if (!q) return true;
    return [m.displayName, m.email, m.organization, m.chapter, m.role].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="directory-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, chapter, or email"
            className="pl-9"
            aria-label="Search members"
          />
        </div>
        {orgs.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by organization">
            <Chip active={org === ALL} onClick={() => setOrg(ALL)}>
              All ({members.length})
            </Chip>
            {orgs.map((o) => (
              <Chip key={o.key} active={org === o.key} onClick={() => setOrg(o.key)} color={o.color}>
                {o.label} ({o.count})
              </Chip>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <PortalEmpty title="No members match" description="Try a different name or clear the organization filter." />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {shown.map((m) => {
            const b = getDivineNineBrand(m.organization);
            const initials = (m.displayName ?? '?')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <li key={m.id} className="grid grid-cols-[auto_1fr] items-center gap-4 py-4 sm:grid-cols-[auto_1.2fr_1fr_1fr] sm:gap-6">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-headline text-base font-bold text-foreground">
                  {m.avatarUrl?.startsWith('https://') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials || '?'
                  )}
                  <span
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{ background: b?.colors[0] ?? 'hsl(var(--brand-gold))' }}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-headline text-lg font-bold leading-tight">{m.displayName}</p>
                  {m.role && <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold">{m.role}</p>}
                </div>
                <div className="col-start-2 min-w-0 sm:col-start-auto">
                  {(b || m.organization) && (
                    <p className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: b?.colors[0] ?? 'hsl(var(--brand-gold))' }} aria-hidden />
                      <span className="truncate font-semibold">{b?.shortName ?? m.organization}</span>
                    </p>
                  )}
                  {m.chapter && <p className="mt-0.5 truncate pl-[18px] text-xs text-muted-foreground">{m.chapter}</p>}
                </div>
                <div className="col-start-2 min-w-0 text-sm sm:col-start-auto">
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="block truncate hover:underline underline-offset-4">
                      {m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a href={`tel:${m.phone.replace(/[^+\d]/g, '')}`} className="block truncate text-muted-foreground hover:underline underline-offset-4">
                      {m.phone}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chip({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active ? 'border-ink bg-ink text-ivory' : 'border-border bg-card text-foreground hover:border-ink/40'
      )}
    >
      {color && <span className="h-2 w-2 rounded-sm" style={{ background: color }} aria-hidden />}
      {children}
    </button>
  );
}
