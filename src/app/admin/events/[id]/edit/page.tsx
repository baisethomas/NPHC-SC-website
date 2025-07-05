import { getEventBySlug } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditEventForm } from "./edit-form";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await getEventBySlug(params.id);

  if (!event) {
    notFound();
  }

  return <EditEventForm event={event} />;
}
