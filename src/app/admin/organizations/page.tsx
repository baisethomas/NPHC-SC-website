import Link from "next/link";
import Image from "next/image";
import { Pencil, PlusCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getOrganizations, getDivineNine } from "@/lib/data";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { AdminPageHeader, AdminPanel, AdminEmpty, AdminCount } from "@/components/admin/admin-page-header";
import { DeleteOrganizationButton } from "./delete-button";

export default async function AdminOrganizationsPage() {
  const [{ organizations, error }, divineNine] = await Promise.all([getOrganizations(), getDivineNine()]);

  const createButton = (
    <Button asChild className="bg-ink text-ivory hover:bg-ink/90">
      <Link href="/admin/organizations/new">
        <PlusCircle className="h-4 w-4" />
        Add chapter
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Organizations"
        description="Local chapters listed on the Chapters page, and the nine national organizations behind them."
        meta={<AdminCount>{organizations.length} chapter{organizations.length === 1 ? "" : "s"}</AdminCount>}
        action={createButton}
      />

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error loading organizations</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {organizations.length === 0 && !error ? (
        <AdminEmpty action={createButton}>No local chapters yet. Add one for each organization active in Solano County.</AdminEmpty>
      ) : (
        <AdminPanel title="Local chapters" className="overflow-hidden [&>div]:p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>President</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => {
                  const brand = getDivineNineBrand(org.name);
                  return (
                    <TableRow key={org.id}>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 font-semibold">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: brand?.colors[0] ?? "hsl(var(--brand-gold))" }} aria-hidden />
                          {org.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{org.chapter || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-sm">{org.president || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/organizations/${org.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <DeleteOrganizationButton organizationId={org.id} organizationName={org.name} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {organizations.map((org) => {
              const brand = getDivineNineBrand(org.name);
              return (
                <li key={org.id} className="flex items-center gap-3 p-4">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: brand?.colors[0] ?? "hsl(var(--brand-gold))" }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[org.chapter, org.president].filter(Boolean).join(" · ") || "No chapter details yet"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/organizations/${org.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <DeleteOrganizationButton organizationId={org.id} organizationName={org.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        </AdminPanel>
      )}

      <AdminPanel
        title="The Divine Nine"
        description="The national organizations shown on the homepage and Programs page. Edit a crest or name; the order is their founding order."
        className="overflow-hidden [&>div]:p-0"
      >
        <ul className="divide-y divide-border">
          {divineNine.map((org) => {
            const brand = getDivineNineBrand(org.name);
            return (
              <li key={org.id} className="flex items-center gap-4 px-5 py-3">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-ivory ring-1 ring-border">
                  <Image src={org.logo} alt="" fill className="object-contain p-1" sizes="40px" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">{org.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {brand ? `${brand.letters} · Est. ${brand.founded}` : `Order ${org.order}`}
                  </p>
                </div>
                {brand && (
                  <span className="hidden h-2.5 w-10 shrink-0 overflow-hidden rounded-sm sm:flex" aria-hidden>
                    <span className="h-full flex-1" style={{ background: brand.colors[0] }} />
                    <span className="h-full flex-1" style={{ background: brand.colors[1] }} />
                  </span>
                )}
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/admin/organizations/divine-nine/${org.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit {org.name}</span>
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </AdminPanel>
    </div>
  );
}
