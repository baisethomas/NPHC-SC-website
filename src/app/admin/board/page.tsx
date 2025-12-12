import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBoardMembers } from "@/lib/data";
import { PlusCircle, Trash2, Pencil, Terminal } from "lucide-react";
import Link from "next/link";
import { deleteBoardMember } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminBoardPage() {
  const { boardMembers, error } = await getBoardMembers();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Executive Board</CardTitle>
            <CardDescription>Manage your organization&apos;s board members.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/board/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Member
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boardMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.title}</TableCell>
                <TableCell className="text-right">
                   <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/board/${member.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  <form action={async (formData: FormData) => {
                    'use server';
                    await deleteBoardMember(formData);
                  }} className="inline-block">
                    <input type="hidden" name="id" value={member.id} />
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
      </CardContent>
    </Card>
  );
}
