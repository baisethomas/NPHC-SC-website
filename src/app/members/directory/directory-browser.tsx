'use client';

import { useMemo, useState } from 'react';
import { Building2, Mail, Phone, Search, UserCircle } from 'lucide-react';
import type { MemberProfile } from '@/lib/definitions';
import { getDivineNineBrand } from '@/lib/divine-nine-brand';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
        <Card className="border-2 border-dashed shadow-none">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <UserCircle className="h-8 w-8 text-slate-300" />
            <p className="mt-3 font-medium text-slate-900">No members match</p>
            <p className="mt-1 text-sm text-slate-500">Try a different name or clear the organization filter.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((m) => {
            const b = getDivineNineBrand(m.organization);
            const initials = (m.displayName ?? '?')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <li key={m.id}>
                <Card className="h-full border-slate-200 shadow-none">
                  <CardContent className="flex gap-4 p-5">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 font-headline text-lg font-bold text-slate-800"
                      style={b ? { boxShadow: `inset 0 0 0 3px ${b.colors[0]}` } : undefined}
                    >
                      {m.avatarUrl?.startsWith('https://') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials || '?'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{m.displayName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {m.role && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{m.role}</Badge>}
                      </div>
                      <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
                        {(b || m.organization) && (
                          <div className="flex items-start gap-2">
                            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <dd className="min-w-0">
                              <span className="block truncate font-medium text-slate-900">{b?.shortName ?? m.organization}</span>
                              {m.chapter && <span className="block truncate text-xs text-slate-500">{m.chapter}</span>}
                            </dd>
                          </div>
                        )}
                        {m.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                            <a href={`mailto:${m.email}`} className="truncate hover:underline underline-offset-4">
                              {m.email}
                            </a>
                          </div>
                        )}
                        {m.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                            <a href={`tel:${m.phone.replace(/[^+\d]/g, '')}`} className="hover:underline underline-offset-4">
                              {m.phone}
                            </a>
                          </div>
                        )}
                      </dl>
                    </div>
                  </CardContent>
                </Card>
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
        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
      )}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />}
      {children}
    </button>
  );
}
