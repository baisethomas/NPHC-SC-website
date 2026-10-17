import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
      <section className="bg-ink text-ivory">
        <div className="container py-12 md:py-16">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-ivory/70 hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> All news
          </Link>
          <div className="mt-6 max-w-3xl">
            <p className="eyebrow mb-3">{announcement.date}</p>
            <h1 className="font-headline text-4xl font-bold leading-[1.1] [text-wrap:balance] md:text-5xl">{announcement.title}</h1>
          </div>
        </div>
        <div className="h-1 w-full bg-gold" />
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {announcement.imageUrl && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-lg bg-secondary">
                <Image src={announcement.imageUrl} alt={announcement.title} fill className="object-cover" sizes="(min-width: 768px) 768px, 100vw" priority />
              </div>
            )}
            <div className="prose prose-lg max-w-none text-foreground/85">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.description) }} />
              ) : (
                paragraphs.map((p, i) => <p key={i}>{p}</p>)
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
