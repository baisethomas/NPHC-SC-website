import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrganizations, getDivineNine } from "@/lib/data";
import { PlusCircle, Pencil, Terminal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DeleteOrganizationButton } from "./delete-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function AdminOrganizationsPage() {
  const [{ organizations, error }, divineNine] = await Promise.all([
    getOrganizations(),
    getDivineNine(),
  ]);

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>Manage your member organizations.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/organizations/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Organization
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Data</AlertTitle>
                <AlertDescription>
                   {error}
                </AlertDescription>
            </Alert>
        )}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>President</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.chapter}</TableCell>
                  <TableCell>{org.president}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 mt-4 md:hidden">
          {organizations.map((org) => (
            <Card key={org.id} className="overflow-hidden border border-gray-200">
              <CardContent className="p-4 flex flex-col gap-3">
                <div>
                  <div className="font-bold text-lg">{org.name}</div>
                  {org.chapter && <div className="text-sm text-gray-500">Chapter: {org.chapter}</div>}
                  {org.president && <div className="text-sm text-gray-500">President: {org.president}</div>}
                </div>
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <Link href={`/admin/organizations/${org.id}/edit`}>
                      <Pencil className="h-3 w-3 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteOrganizationButton organizationId={org.id} organizationName={org.name} variant="full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Divine Nine</CardTitle>
        <CardDescription>
          Manage the nine national organizations shown on the homepage and Programs page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Crest</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[80px]">Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {divineNine.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <Image
                      src={org.logo}
                      alt={`${org.name} crest`}
                      width={48}
                      height={48}
                      className="rounded-md object-contain"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.order}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/organizations/divine-nine/${org.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit {org.name}</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 mt-4 md:hidden">
          {divineNine.map((org) => (
            <Card key={org.id} className="overflow-hidden border border-gray-200">
              <CardContent className="p-4 flex items-center gap-4">
                <Image
                  src={org.logo}
                  alt={`${org.name} crest`}
                  width={48}
                  height={48}
                  className="rounded-md object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{org.name}</div>
                  <div className="text-sm text-gray-500">Order: {org.order}</div>
                </div>
                <Button asChild variant="outline" size="sm" className="h-8 shrink-0">
                  <Link href={`/admin/organizations/divine-nine/${org.id}/edit`}>
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
