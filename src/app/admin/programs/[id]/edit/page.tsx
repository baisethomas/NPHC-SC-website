import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getProgramById } from "../../actions";
import { EditProgramForm } from "./edit-form";

interface EditProgramPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
  const { id } = await params;
  const program = await getProgramById(id);

  if (!program) {
    notFound();
  }

  return (
    <div>
      <AdminPageHeader
        className="mb-8"
        backHref="/admin/programs"
        backLabel="Programs"
        title="Edit program"
        description={program.name}
      />

      <EditProgramForm program={program} />
    </div>
  );
}
