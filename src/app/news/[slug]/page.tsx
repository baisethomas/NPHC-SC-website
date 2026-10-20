import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAnnouncementBySlug } from '@/lib/data';
import { sanitizeHtml } from '@/lib/sanitizer';

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);
  if (!announcement) notFound();

  const isHtml = announcement.description.includes('<') && announcement.description.includes('>');
  const paragraphs = isHtml ? [] : announcement.description.split('\n').filter((p) => p.trim() !== '');

  return (
    <article>
      <header className="border-b border-border">
        <div className="container py-10 md:py-14">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All news
          </Link>
          <div className="mx-auto mt-8 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{announcement.date}</p>
            <h1 className="mt-3 font-headline text-4xl font-bold leading-[1.08] [text-wrap:balance] md:text-5xl">{announcement.title}</h1>
            <div className="gold-rule mt-6" />
          </div>
        </div>
      </header>

      {announcement.imageUrl && (
        <div className="container pt-10">
          <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-lg bg-secondary">
            <Image src={announcement.imageUrl} alt={announcement.title} fill className="object-cover" sizes="(min-width: 1024px) 896px, 100vw" priority />
          </div>
        </div>
      )}

      <section className="py-10 md:py-14">
        <div className="container">
          <div className="prose prose-lg mx-auto max-w-3xl text-foreground/85 prose-headings:font-headline">
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.description) }} />
            ) : (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
          <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-6">
            <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline underline-offset-4">
              More from the council <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
