import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAnnouncements } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";

function plain(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function NewsPage() {
  const { announcements, error } = await getAnnouncements();
  const [lead, ...rest] = announcements;

  return (
    <div>
      <PageHero eyebrow="News" title="Announcements from the council" lede="Updates from the executive board and the nine chapters." />

      <section className="py-12 md:py-16">
        <div className="container">
          {error ? (
            <Alert variant="destructive" className="mx-auto max-w-4xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error loading news</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !lead ? (
            <div className="border-y border-border py-12">
              <p className="font-headline text-2xl font-bold">No news yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back later for announcements and updates.</p>
            </div>
          ) : (
            <>
              {/* Lead story */}
              <article className="grid gap-8 md:grid-cols-12 md:items-center">
                {lead.imageUrl ? (
                  <Link href={`/news/${lead.id}`} className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-secondary md:col-span-7">
                    <Image src={lead.imageUrl} alt={lead.title} fill className="object-cover" sizes="(min-width: 768px) 58vw, 100vw" priority />
                  </Link>
                ) : (
                  <div className="hidden md:col-span-1 md:block" aria-hidden />
                )}
                <div className={lead.imageUrl ? "md:col-span-5" : "md:col-span-10"}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{lead.date}</p>
                  <h2 className="mt-3 font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl lg:text-5xl">
                    <Link href={`/news/${lead.id}`} className="hover:underline underline-offset-4">
                      {lead.title}
                    </Link>
                  </h2>
                  <p className="mt-5 line-clamp-4 text-lg leading-relaxed text-muted-foreground">{plain(lead.description)}</p>
                  <Link href={`/news/${lead.id}`} className="mt-5 inline-flex items-center gap-1 font-semibold hover:underline underline-offset-4">
                    Read the announcement <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>

              {/* Everything else as dated rows */}
              {rest.length > 0 && (
                <ul className="mt-14 divide-y divide-border border-y border-border">
                  {rest.map((item) => (
                    <li key={item.id}>
                      <Link href={`/news/${item.id}`} className="group grid gap-4 py-7 sm:grid-cols-[7rem_1fr] sm:gap-8 md:grid-cols-[9rem_1fr_auto]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:pt-1.5">{item.date}</p>
                        <div className="min-w-0">
                          <h3 className="font-headline text-2xl font-bold leading-snug group-hover:underline underline-offset-4">{item.title}</h3>
                          <p className="mt-2 line-clamp-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{plain(item.description)}</p>
                        </div>
                        {item.imageUrl ? (
                          <div className="relative hidden aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-md bg-secondary md:block">
                            <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="144px" />
                          </div>
                        ) : (
                          <ArrowRight className="hidden h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 md:block" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
