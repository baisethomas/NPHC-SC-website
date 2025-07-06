import { getOrganizationById } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditOrganizationForm } from "./edit-form";

export default async function EditOrganizationPage({ params }: { params: { id: string } }) {
  const organization = await getOrganizationById(params.id);

  if (!organization) {
    notFound();
  }

  return <EditOrganizationForm organization={organization} />;
}
