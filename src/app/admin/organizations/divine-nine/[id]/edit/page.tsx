import { getDivineNine } from "@/lib/data";
import { notFound } from "next/navigation";
import { EditDivineNineForm } from "./edit-form";

export default async function EditDivineNinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organizations = await getDivineNine();
  const organization = organizations.find((org) => org.id === id);

  if (!organization) {
    notFound();
  }

  return <EditDivineNineForm organization={organization} />;
}
