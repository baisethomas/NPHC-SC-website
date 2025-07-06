
import { getOrganizationById } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditOrganizationForm } from "./edit-form";

export default function EditOrganizationPage({ params }: { params: { id: string } }) {
  const organization = getOrganizationById(params.id);

  if (!organization) {
    notFound();
  }

  return <EditOrganizationForm organization={organization} />;
}
