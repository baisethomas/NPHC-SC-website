import Link from "next/link";
import { Camera, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/page-hero";

export default async function GalleryPage() {
  const { instagramUrl } = await getSiteSettings();

  return (
    <div>
      <PageHero eyebrow="Gallery" title="Moments from the yard" lede="Photos from council events, chapter programs, and community service across Solano County." />
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-xl rounded-lg border border-dashed border-border p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-gold">
              <Camera className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-headline text-2xl font-bold">Albums are on the way</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We are gathering photos from recent events. Until then, the chapters post regularly on social media.
            </p>
            {instagramUrl && (
              <Button asChild variant="outline" className="mt-6">
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" /> Follow on Instagram
                </a>
              </Button>
            )}
            <p className="mt-6 text-xs text-muted-foreground">
              Have photos from a council event? <Link href="/contact?subject=Photos" className="font-semibold text-gold hover:underline underline-offset-4">Send them our way.</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
