import { getAnnouncementBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitizer';
import Image from 'next/image';

export default async function AnnouncementDetailPage({ params }: { params: { slug: string } }) {
  const announcement = await getAnnouncementBySlug(params.slug);

  if (!announcement) {
    notFound();
  }

  // Check if content is HTML (from rich text editor) or plain text
  const isHtml = announcement.description.includes('<') && announcement.description.includes('>');
  const paragraphs = isHtml ? [] : announcement.description.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="bg-background">
        <section className="py-12 bg-muted">
            <div className="container">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold mb-3">{announcement.title}</h1>
                    <div className="flex items-center justify-center text-muted-foreground mb-4">
                        <Calendar className="mr-2 h-5 w-5" />
                        <p>{announcement.date}</p>
                    </div>
                    {announcement.imageUrl && (
                      <div className="flex justify-center mb-6">
                        <Image
                          src={announcement.imageUrl}
                          alt={announcement.title}
                          width={600}
                          height={400}
                          className="rounded-lg max-h-96 w-auto object-contain shadow"
                        />
                      </div>
                    )}
                </div>
            </div>
        </section>
        <section className="py-16 md:py-24">
            <div className="container">
                 <div className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-foreground/90">
                    {isHtml ? (
                      <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.description) }}
                      />
                    ) : (
                      paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))
                    )}
                </div>
            </div>
        </section>
    </div>
  );
}
