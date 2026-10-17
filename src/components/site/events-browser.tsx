'use client';

import { useMemo, useState } from "react";
import { CalendarDays, LayoutGrid } from "lucide-react";
import type { Event } from "@/lib/definitions";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { cn } from "@/lib/utils";
import { EventListCard } from "./event-list-card";
import { EventCalendar } from "@/components/event-calendar";

const ALL = "__all";
const COUNCIL = "__council";

/**
 * Upcoming and past events with host-organization filter chips and a
 * list / calendar toggle. Receives already-split lists from the server.
 */
export function EventsBrowser({ upcoming, past }: { upcoming: Event[]; past: Event[] }) {
  const [filter, setFilter] = useState<string>(ALL);
  const [view, setView] = useState<"list" | "calendar">("list");

  const hosts = useMemo(() => {
    const seen = new Map<string, { key: string; label: string; color: string }>();
    for (const e of [...upcoming, ...past]) {
      const brand = getDivineNineBrand(e.hostOrganization);
      if (brand && !seen.has(brand.key)) seen.set(brand.key, { key: brand.key, label: brand.shortName, color: brand.colors[0] });
    }
    return [...seen.values()];
  }, [upcoming, past]);

  const hasCouncilEvents = [...upcoming, ...past].some((e) => !getDivineNineBrand(e.hostOrganization));

  const matches = (e: Event) => {
    if (filter === ALL) return true;
    const brand = getDivineNineBrand(e.hostOrganization);
    if (filter === COUNCIL) return !brand;
    return brand?.key === filter;
  };

  const shownUpcoming = upcoming.filter(matches);
  const shownPast = past.filter(matches).slice(0, 6);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {hosts.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by host organization">
            <Chip active={filter === ALL} onClick={() => setFilter(ALL)}>All events</Chip>
            {hasCouncilEvents && (
              <Chip active={filter === COUNCIL} onClick={() => setFilter(COUNCIL)} color="hsl(var(--brand-gold))">
                NPHC Solano
              </Chip>
            )}
            {hosts.map((h) => (
              <Chip key={h.key} active={filter === h.key} onClick={() => setFilter(h.key)} color={h.color}>
                {h.label}
              </Chip>
            ))}
          </div>
        ) : (
          <div />
        )}
        <div className="inline-flex shrink-0 rounded-md border border-border bg-card p-0.5" role="tablist" aria-label="View">
          <ViewButton active={view === "list"} onClick={() => setView("list")} icon={LayoutGrid} label="List" />
          <ViewButton active={view === "calendar"} onClick={() => setView("calendar")} icon={CalendarDays} label="Calendar" />
        </div>
      </div>

      {view === "calendar" ? (
        <EventCalendar events={[...upcoming, ...past].filter(matches)} />
      ) : (
        <>
          <section>
            <h2 className="eyebrow mb-5">Upcoming</h2>
            {shownUpcoming.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center">
                <p className="font-semibold">Nothing scheduled{filter !== ALL ? " for this filter" : " yet"}.</p>
                <p className="mt-1 text-sm text-muted-foreground">Join the mailing list and we will let you know when the next event is posted.</p>
              </div>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shownUpcoming.map((e) => (
                  <li key={e.id}>
                    <EventListCard event={e} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {shownPast.length > 0 && (
            <section>
              <h2 className="eyebrow mb-5">Recent</h2>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shownPast.map((e) => (
                  <li key={e.id}>
                    <EventListCard event={e} past />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
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
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-ink bg-ink text-ivory" : "border-border bg-card text-foreground hover:border-ink/40"
      )}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />}
      {children}
    </button>
  );
}

function ViewButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-ink text-ivory" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
