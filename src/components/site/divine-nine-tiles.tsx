import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DIVINE_NINE_BRANDS, getDivineNineBrand, textOn } from "@/lib/divine-nine-brand";
import { cn } from "@/lib/utils";

type OrgLike = { id: string; name: string; logo: string };

/**
 * The nine organizations as solid tiles in their own colors, in founding order.
 * This is the one place on the site where the organizations' palettes lead and
 * the council's ink and gold step back.
 */
export function DivineNineTiles({ organizations, className }: { organizations: OrgLike[]; className?: string }) {
  const tiles = DIVINE_NINE_BRANDS.map((brand) => {
    const org = organizations.find((o) => getDivineNineBrand(o.name)?.key === brand.key);
    return { brand, org };
  });

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {tiles.map(({ brand, org }) => {
        const [primary, secondary] = brand.colors;
        const tone = textOn(primary);
        const ink = tone === "ink";
        return (
          <li key={brand.key}>
            <Link
              href="/organizations"
              className={cn(
                "group relative flex min-h-[9.5rem] items-center gap-5 overflow-hidden rounded-lg p-5 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
                ink ? "text-ink" : "text-ivory"
              )}
              style={{ background: primary }}
              title={org?.name ?? brand.shortName}
            >
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-ivory shadow-sm">
                {org ? (
                  <Image src={org.logo} alt="" width={112} height={112} className="h-14 w-14 object-contain" />
                ) : (
                  <span className="font-headline text-2xl font-bold text-ink">{brand.letters}</span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-headline text-3xl font-bold leading-none">{brand.letters}</span>
                <span className="mt-2 block text-sm font-semibold leading-tight">{brand.shortName}</span>
                <span className={cn("mt-1 block text-xs", ink ? "text-ink/70" : "text-ivory/70")}>
                  Est. {brand.founded} · {brand.foundedAt.replace(" University", "")}
                </span>
              </span>
              <ArrowUpRight
                className={cn(
                  "h-5 w-5 shrink-0 self-start opacity-0 transition-opacity group-hover:opacity-100",
                  ink ? "text-ink/70" : "text-ivory/80"
                )}
              />
              <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: secondary }} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Nine small color chips, one per organization, for a quiet brand signature. */
export function DivineNineChips({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-hidden>
      {DIVINE_NINE_BRANDS.map((b) => (
        <span key={b.key} className="h-2.5 w-2.5 rounded-sm" style={{ background: b.colors[0] }} />
      ))}
    </span>
  );
}
