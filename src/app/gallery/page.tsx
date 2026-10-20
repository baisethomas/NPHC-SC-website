import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteContent } from "@/lib/site-content";
import { PageHero } from "@/components/site/page-hero";

export default async function GalleryPage() {
  const [{ instagramUrl }, content] = await Promise.all([getSiteSettings(), getSiteContent(["home.hero.image"])]);

  return (
    <div>
      <PageHero eyebrow="Gallery" title="Moments from the yard" lede="Photos from council events, chapter programs, and community service across Solano County." />

      <section className="py-12 md:py-20">
        <div className="container">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image src={content["home.hero.image"]} alt="Members of the NPHC of Solano County gathered at a community event" fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gold" aria-hidden />
          </div>

          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-6">
              <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">Albums are on the way.</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                We are gathering photos from recent council and chapter events. Until the first albums are posted, the chapters share regularly on social media.
              </p>
              {instagramUrl && (
                <Button asChild className="mt-6 bg-gold text-ink hover:bg-gold/90">
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    Follow on Instagram <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <ul className="divide-y divide-border border-y border-border">
                <li className="flex items-start justify-between gap-6 py-5">
                  <div>
                    <p className="font-headline text-lg font-bold">Have photos from an event?</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Send them to the council and we will add them to the album with credit.</p>
                  </div>
                  <Link href="/contact?subject=Photos" className="shrink-0 whitespace-nowrap text-sm font-semibold hover:underline underline-offset-4">
                    Send photos <ArrowRight className="inline h-3.5 w-3.5" />
                  </Link>
                </li>
                <li className="flex items-start justify-between gap-6 py-5">
                  <div>
                    <p className="font-headline text-lg font-bold">Be in the next one</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Council and chapter events are open to the public.</p>
                  </div>
                  <Link href="/events" className="shrink-0 whitespace-nowrap text-sm font-semibold hover:underline underline-offset-4">
                    See events <ArrowRight className="inline h-3.5 w-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
