import Link from "next/link";
import Image from "next/image";
import { Pencil, PlusCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { AdminPageHeader, AdminPanel, AdminEmpty, AdminCount } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { getPrograms } from "./actions";
import { DeleteButton } from "./delete-button";

export default async function AdminProgramsPage() {
  const { programs, error } = await getPrograms();

  const programsByOrg = programs.reduce(
    (acc, program) => {
      (acc[program.organizationName] ??= []).push(program);
      return acc;
    },
    {} as Record<string, typeof programs>
  );

  const createButton = (
    <Button asChild className="bg-ink text-ivory hover:bg-ink/90">
      <Link href="/admin/programs/new">
        <PlusCircle className="h-4 w-4" />
        Add program
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Programs"
        description="Programs and initiatives run by each chapter, grouped by organization."
        meta={<AdminCount>{programs.length} program{programs.length === 1 ? "" : "s"}</AdminCount>}
        action={createButton}
      />

      {error ? (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error loading programs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : programs.length === 0 ? (
        <AdminEmpty action={createButton}>No programs yet. Add one and it will appear on the Programs page under its organization.</AdminEmpty>
      ) : (
        Object.entries(programsByOrg).map(([orgName, orgPrograms]) => {
          const brand = getDivineNineBrand(orgName);
          return (
            <AdminPanel
              key={orgName}
              className="overflow-hidden [&>div]:p-0"
              title={brand?.shortName ?? orgName}
              description={`${orgPrograms.length} program${orgPrograms.length === 1 ? "" : "s"}`}
              action={brand && <span className="h-2.5 w-10 rounded-sm" style={{ background: brand.colors[0] }} aria-hidden />}
            >
              <ul className="divide-y divide-border">
                {orgPrograms.map((program) => (
                  <li key={program.id} className="flex items-start gap-4 px-5 py-4">
                    <span className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-md bg-secondary sm:block">
                      {program.image && <Image src={program.image} alt="" fill className="object-cover" sizes="80px" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold leading-tight">{program.name}</p>
                        <StatusBadge status={program.status || "active"} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{program.category}</p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{program.description}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/programs/${program.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit program</span>
                        </Link>
                      </Button>
                      <DeleteButton programId={program.id} programName={program.name} />
                    </div>
                  </li>
                ))}
              </ul>
            </AdminPanel>
          );
        })
      )}
    </div>
  );
}
