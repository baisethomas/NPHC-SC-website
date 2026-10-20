'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, List } from "lucide-react";
import type { Event } from "@/lib/definitions";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { parseEventDate } from "@/lib/events";
import { cn } from "@/lib/utils";
import { EventAgenda } from "./event-agenda";
import { EventListCard } from "./event-list-card";
import { EventCalendar } from "@/components/event-calendar";

const ALL = "__all";
const COUNCIL = "__council";

function monthKey(event: Event): string {
  const when = parseEventDate(event);
  return when ? when.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Date to be announced";
}

function groupByMonth(events: Event[]): { label: string; events: Event[] }[] {
  const groups: { label: string; events: Event[] }[] = [];
  for (const e of events) {
    const label = monthKey(e);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.events.push(e);
    else groups.push({ label, events: [e] });
  }
  return groups;
}

/**
 * Upcoming events as a month-by-month agenda, past events as a quieter recap
 * row, with host-organization filter chips and a list / calendar toggle.
 * Receives already-split lists from the server.
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
  const months = groupByMonth(shownUpcoming);

  return (
    <div className="space-y-14">
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
          <ViewButton active={view === "list"} onClick={() => setView("list")} icon={List} label="Agenda" />
          <ViewButton active={view === "calendar"} onClick={() => setView("calendar")} icon={CalendarDays} label="Calendar" />
        </div>
      </div>

      {view === "calendar" ? (
        <EventCalendar events={[...upcoming, ...past].filter(matches)} />
      ) : (
        <>
          {months.length === 0 ? (
            <div className="border-y border-border py-12">
              <p className="font-headline text-2xl font-bold">Nothing scheduled{filter !== ALL ? " for this filter" : " yet"}.</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Join the mailing list and we will let you know when the next event is posted.{" "}
                <Link href="/mailing-list" className="font-semibold text-gold hover:underline underline-offset-4">
                  Join the list
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {months.map((group) => (
                <section key={group.label} className="grid gap-4 lg:grid-cols-12 lg:gap-8">
                  <h2 className="font-headline text-2xl font-bold leading-none lg:col-span-3 lg:pt-5 lg:text-3xl">{group.label}</h2>
                  <div className="lg:col-span-9">
                    <EventAgenda events={group.events} />
                  </div>
                </section>
              ))}
            </div>
          )}

          {shownPast.length > 0 && (
            <section className="border-t border-border pt-10">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="font-headline text-2xl font-bold">Recently</h2>
                <p className="text-sm text-muted-foreground">Photos and recaps from past events.</p>
              </div>
              <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
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
