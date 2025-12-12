import { getOrganizationById } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditOrganizationForm } from "./edit-form";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = await getOrganizationById(id);

  if (!organization) {
    notFound();
  }

  return <EditOrganizationForm organization={organization} />;
}
