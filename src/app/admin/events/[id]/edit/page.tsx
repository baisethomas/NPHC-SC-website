import { getEventBySlug } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditEventForm } from "./edit-form";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventBySlug(id);

  if (!event) {
    notFound();
  }

  return <EditEventForm event={event} />;
}
