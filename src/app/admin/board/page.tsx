import Link from "next/link";
import Image from "next/image";
import { Pencil, PlusCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getBoardMembers } from "@/lib/data";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { AdminPageHeader, AdminPanel, AdminEmpty, AdminCount } from "@/components/admin/admin-page-header";
import { DeleteBoardMemberButton } from "./delete-button";

function Portrait({ src, alt, initials }: { src?: string; alt: string; initials: string }) {
  return (
    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ink">
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover object-top" sizes="48px" />
      ) : (
        <span className="flex h-full items-center justify-center font-headline text-sm font-bold text-gold">{initials}</span>
      )}
    </span>
  );
}

export default async function AdminBoardPage() {
  const { boardMembers, error } = await getBoardMembers();

  const createButton = (
    <Button asChild className="bg-ink text-ivory hover:bg-ink/90">
      <Link href="/admin/board/new">
        <PlusCircle className="h-4 w-4" />
        Add board member
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Board members"
        description="The executive board shown on the About page and in the member portal."
        meta={<AdminCount>{boardMembers.length} officer{boardMembers.length === 1 ? "" : "s"}</AdminCount>}
        action={createButton}
      />

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error loading board members</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {boardMembers.length === 0 && !error ? (
        <AdminEmpty action={createButton}>No board members yet. Add the president first so the homepage quote has a name.</AdminEmpty>
      ) : (
        <AdminPanel className="overflow-hidden [&>div]:p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boardMembers.map((member) => {
                  const brand = getDivineNineBrand(member.organization);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Portrait src={member.image} alt={member.name} initials={member.initials} />
                      </TableCell>
                      <TableCell className="font-semibold">{member.name}</TableCell>
                      <TableCell className="text-sm">{member.title}</TableCell>
                      <TableCell className="text-sm">
                        {member.organization ? (
                          <span className="inline-flex items-center gap-1.5">
                            {brand && <span className="h-2 w-2 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />}
                            {brand?.shortName ?? member.organization}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/board/${member.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <DeleteBoardMemberButton memberId={member.id} memberName={member.name} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {boardMembers.map((member) => {
              const brand = getDivineNineBrand(member.organization);
              return (
                <li key={member.id} className="flex items-center gap-4 p-4">
                  <Portrait src={member.image} alt={member.name} initials={member.initials} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.title}</p>
                    {member.organization && (
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        {brand && <span className="h-2 w-2 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />}
                        {brand?.shortName ?? member.organization}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/board/${member.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <DeleteBoardMemberButton memberId={member.id} memberName={member.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        </AdminPanel>
      )}
    </div>
  );
}
