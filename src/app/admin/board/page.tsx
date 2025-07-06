import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBoardMembers } from "@/lib/data";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteBoardMember } from "./actions";

export default function AdminBoardPage() {
  const boardMembers = getBoardMembers();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Executive Board</CardTitle>
            <CardDescription>Manage your organization's board members.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/board/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Member
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boardMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.title}</TableCell>
                <TableCell className="text-right">
                   <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/board/${member.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  <form action={deleteBoardMember} className="inline-block">
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
