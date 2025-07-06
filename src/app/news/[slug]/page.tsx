
import { getAnnouncementBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default async function AnnouncementDetailPage({ params }: { params: { slug: string } }) {
  const announcement = await getAnnouncementBySlug(params.slug);

  if (!announcement) {
    notFound();
  }

  // A simple way to treat newlines as paragraphs
  const paragraphs = announcement.description.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="bg-background">
        <section className="py-12 bg-muted">
            <div className="container">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold mb-3">{announcement.title}</h1>
                    <div className="flex items-center justify-center text-muted-foreground">
                        <Calendar className="mr-2 h-5 w-5" />
                        <p>{announcement.date}</p>
                    </div>
                </div>
            </div>
        </section>
        <section className="py-16 md:py-24">
            <div className="container">
                 <div className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-foreground/90">
                    {paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </section>
    </div>
  );
}
