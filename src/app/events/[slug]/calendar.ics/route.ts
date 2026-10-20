import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/data';
import { buildIcs, slugifyFilename } from '@/lib/events';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    decoded = slug;
  }

  const event = await getEventBySlug(decoded);
  if (!event) return new NextResponse('Not found', { status: 404 });

  const origin = new URL(request.url).origin;
  const ics = buildIcs(event, `${origin}/events/${encodeURIComponent(event.slug)}`);
  if (!ics) return new NextResponse('Event has no parseable date', { status: 422 });

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slugifyFilename(event.title)}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  });
}
