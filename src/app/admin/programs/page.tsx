import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Terminal } from "lucide-react";
import Link from "next/link";
import { getPrograms } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DeleteButton } from "./delete-button";
import Image from "next/image";

export default async function AdminProgramsPage() {
  const { programs, error } = await getPrograms();

  const getCategoryColor = (category: string) => {
    const colors = {
      "Education": "bg-blue-100 text-blue-800",
      "Youth Development": "bg-green-100 text-green-800",
      "Health & Wellness": "bg-red-100 text-red-800",
      "Civic Engagement": "bg-purple-100 text-purple-800",
      "Leadership": "bg-yellow-100 text-yellow-800",
      "Economic Development": "bg-indigo-100 text-indigo-800",
      "Community Service": "bg-pink-100 text-pink-800",
      "Community Development": "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "active": "bg-green-100 text-green-800",
      "inactive": "bg-gray-100 text-gray-800",
      "seasonal": "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Group programs by organization
  const programsByOrg = programs.reduce((acc, program) => {
    if (!acc[program.organizationName]) {
      acc[program.organizationName] = [];
    }
    acc[program.organizationName].push(program);
    return acc;
  }, {} as Record<string, typeof programs>);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manage Programs</h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, or remove programs and initiatives for each organization.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/programs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Link>
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Programs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : programs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Programs Found</CardTitle>
            <CardDescription>
              Get started by adding your first program.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/programs/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Program
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(programsByOrg).map(([orgName, orgPrograms]) => (
            <Card key={orgName}>
              <CardHeader>
                <CardTitle className="text-xl">{orgName}</CardTitle>
                <CardDescription>
                  {orgPrograms.length} program{orgPrograms.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {orgPrograms.map((program) => (
                    <Card key={program.id} className="relative">
                      {program.image && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                          <Image
                            src={program.image}
                            alt={program.imageHint || program.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold leading-tight">
                            {program.name}
                          </CardTitle>
                          <div className="flex gap-1 ml-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/admin/programs/${program.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit program</span>
                              </Link>
                            </Button>
                            <DeleteButton
                              programId={program.id}
                              programName={program.name}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getCategoryColor(program.category)}>
                            {program.category}
                          </Badge>
                          <Badge className={getStatusColor(program.status || 'active')}>
                            {program.status || 'active'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {program.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 