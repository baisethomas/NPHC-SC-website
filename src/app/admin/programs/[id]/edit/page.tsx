import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProgramById } from "../../actions";
import { notFound } from "next/navigation";
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
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/programs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Edit Program</h1>
          <p className="text-muted-foreground mt-2">
            Update the program information.
          </p>
        </div>
      </div>

      <EditProgramForm program={program} />
    </div>
  );
} 