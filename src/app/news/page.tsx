import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAnnouncements } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";

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
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="font-semibold">No news yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Check back later for announcements and updates.</p>
            </div>
          ) : (
            <>
              <article className="grid gap-8 border-b border-border pb-12 md:grid-cols-12 md:items-center">
                {lead.imageUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-secondary md:col-span-6">
                    <Image src={lead.imageUrl} alt={lead.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" priority />
                  </div>
                )}
                <div className={lead.imageUrl ? "md:col-span-6" : "md:col-span-8"}>
                  <p className="eyebrow">Latest · {lead.date}</p>
                  <h2 className="mt-3 font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">
                    <Link href={`/news/${lead.id}`} className="hover:underline underline-offset-4">
                      {lead.title}
                    </Link>
                  </h2>
                  <p className="mt-4 line-clamp-4 leading-relaxed text-muted-foreground">{lead.description.replace(/<[^>]+>/g, " ")}</p>
                  <Link href={`/news/${lead.id}`} className="mt-5 inline-flex items-center gap-1 font-semibold text-gold hover:underline underline-offset-4">
                    Read more <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>

              {rest.length > 0 && (
                <ul className="grid gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((item) => (
                    <li key={item.id} className="flex flex-col border-t-2 border-ink pt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.date}</p>
                      <h3 className="mt-3 font-headline text-xl font-bold leading-snug">
                        <Link href={`/news/${item.id}`} className="hover:underline underline-offset-4">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description.replace(/<[^>]+>/g, " ")}</p>
                      <Link href={`/news/${item.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline underline-offset-4">
                        Read more <ArrowRight className="h-3.5 w-3.5" />
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
