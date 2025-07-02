import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrganizations } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function AdminOrganizationsPage() {
  const organizations = getOrganizations();

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Chapter</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={`${org.name}-${org.chapter}`}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>{org.chapter}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" disabled>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
