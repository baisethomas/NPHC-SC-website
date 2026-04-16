import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrganizations } from "@/lib/data";
import { PlusCircle, Trash2, Pencil, Terminal } from "lucide-react";
import Link from "next/link";
import { deleteOrganization } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function AdminOrganizationsPage() {
  const { organizations, error } = await getOrganizations();

  return (
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
                    <form action={deleteOrganization} className="inline-block">
                      <input type="hidden" name="id" value={org.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </form>
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
                  <form action={deleteOrganization} className="inline-block">
                    <input type="hidden" name="id" value={org.id} />
                    <Button variant="destructive" size="sm" type="submit" className="h-8">
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
