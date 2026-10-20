'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    done: diff === 0,
  };
}

/**
 * Days / hours / minutes until `targetIso`. Renders the server-computed value
 * first so there is no layout shift, then ticks every minute on the client.
 */
export function Countdown({ targetIso, className, tone = 'default' }: { targetIso: string; className?: string; tone?: 'default' | 'inverse' }) {
  const target = new Date(targetIso).getTime();
  const [value, setValue] = useState(() => remaining(target));

  useEffect(() => {
    setValue(remaining(target));
    const id = window.setInterval(() => setValue(remaining(target)), 60_000);
    return () => window.clearInterval(id);
  }, [target]);

  if (value.done) {
    return <p className={cn('text-sm font-semibold', tone === 'inverse' ? 'text-gold' : 'text-gold', className)}>Happening now</p>;
  }

  const cells = [
    { label: value.days === 1 ? 'day' : 'days', n: value.days },
    { label: value.hours === 1 ? 'hour' : 'hours', n: value.hours },
    { label: value.minutes === 1 ? 'min' : 'mins', n: value.minutes },
  ];

  return (
    <div className={cn('flex items-end gap-4', className)} aria-live="polite">
      {cells.map((c) => (
        <div key={c.label} className="min-w-[3.5rem] text-center">
          <p className={cn('font-headline text-3xl font-bold leading-none tabular-nums md:text-4xl', tone === 'inverse' ? 'text-ivory' : 'text-foreground')}>
            {c.n}
          </p>
          <p className={cn('mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]', tone === 'inverse' ? 'text-ivory/60' : 'text-muted-foreground')}>
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}
