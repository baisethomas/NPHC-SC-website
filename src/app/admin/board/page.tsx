import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBoardMembers } from "@/lib/data";
import { PlusCircle, Pencil, Terminal } from "lucide-react";
import Link from "next/link";
import { DeleteBoardMemberButton } from "./delete-button";
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
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Organization</TableHead>
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
                  <TableCell>{member.organization || '-'}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 mt-4 md:hidden">
          {boardMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden border border-gray-200 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border border-gray-100">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-lg leading-tight">{member.name}</div>
                    <div className="text-sm font-medium text-violet-600">{member.title}</div>
                    {member.organization && <div className="text-xs text-gray-500 mt-1">{member.organization}</div>}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-gray-100">
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <Link href={`/admin/board/${member.id}/edit`}>
                      <Pencil className="h-3 w-3 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteBoardMemberButton memberId={member.id} memberName={member.name} variant="full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
