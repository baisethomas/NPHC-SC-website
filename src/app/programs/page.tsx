import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDivineNineOrganizations, type DivineNineOrganization } from "@/lib/definitions";
import { getPrograms } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Users, HandHeart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function ProgramsPage() {
  const organizations: DivineNineOrganization[] = getDivineNineOrganizations();
  const { programs, error } = await getPrograms();

  // Filter only active programs
  const activePrograms = programs.filter(program => program.status === 'active' || !program.status);

  // Group programs by organization
  const programsByOrg = activePrograms.reduce((acc, program) => {
    if (!acc[program.organizationName]) {
      acc[program.organizationName] = [];
    }
    acc[program.organizationName].push(program);
    return acc;
  }, {} as Record<string, typeof activePrograms>);

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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Programs & Initiatives</h1>
            <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-muted-foreground text-lg">
              Discover the impactful programs and initiatives led by our Divine Nine organizations, 
              each dedicated to serving our community through education, leadership development, 
              and social action.
            </p>
          </div>
        </div>
      </section>

      {/* Programs by Organization */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          {error ? (
            <Alert variant="destructive" className="max-w-xl mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Programs</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-16">
            {organizations.map((org, index) => {
              const orgPrograms = programsByOrg[org.name as keyof typeof programsByOrg] || [];
              
              return (
                <div key={index} className="space-y-8">
                  {/* Organization Header */}
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <Image 
                        src={org.logo} 
                        alt={`${org.name} logo`} 
                        width={80} 
                        height={80} 
                        className="object-contain"
                        data-ai-hint={org.hint}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-headline font-bold">{org.name}</h2>
                    </div>
                  </div>

                  {/* Programs Grid */}
                  {orgPrograms.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {orgPrograms.map((program, programIndex) => (
                        <Card key={programIndex} className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                          {program.image && (
                            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                              <Image
                                src={program.image}
                                alt={program.imageHint || `${program.name} program image`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-xl font-headline">{program.name}</CardTitle>
                              <Badge className={getCategoryColor(program.category)}>
                                {program.category}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-base leading-relaxed">
                              {program.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Program information for {org.name} will be available soon.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </div>
      </section>

      {/* Vibrant CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-teal-500/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4 text-white">Get Involved & Make an Impact</h2>
            <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-white/90 text-lg mb-12 max-w-2xl mx-auto">
              Ready to make a difference in your community? Join our programs, volunteer your time, or partner with us to create lasting change throughout Solano County.
            </p>
            
            <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
              {/* Volunteer CTA */}
              <Card className="relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white shadow-lg group-hover:shadow-green-500/25 transition-shadow duration-300">
                    <Users className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-headline text-center bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Join Our Programs</CardTitle>
                  <CardDescription className="text-center text-base text-gray-600">
                    Participate in community initiatives and grow through meaningful volunteer opportunities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 text-center">
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-green-500 font-bold">✓</span> Youth mentorship opportunities
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-green-500 font-bold">✓</span> Community service projects
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-green-500 font-bold">✓</span> Leadership development programs
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-green-500 font-bold">✓</span> Educational workshops
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10 flex justify-center">
                  <Button asChild className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ease-in-out hover:scale-105 shadow-lg hover:shadow-green-500/25 text-white font-semibold">
                    <Link href="/contact">
                      <Users className="mr-2 h-4 w-4" />
                      Get Involved
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Partnership CTA */}
              <Card className="relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 via-blue-500/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full text-white shadow-lg group-hover:shadow-teal-500/25 transition-shadow duration-300">
                    <HandHeart className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-headline text-center bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">Partner With Us</CardTitle>
                  <CardDescription className="text-center text-base text-gray-600">
                    Connect with our organizations to create collaborative programs and community partnerships.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 text-center">
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-teal-500 font-bold">✓</span> Program sponsorship opportunities
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-teal-500 font-bold">✓</span> Collaborative initiatives
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-teal-500 font-bold">✓</span> Corporate partnerships
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <span className="text-teal-500 font-bold">✓</span> Resource sharing
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10 flex justify-center">
                  <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 ease-in-out hover:scale-105 shadow-lg hover:shadow-teal-500/25 text-white font-semibold">
                    <Link href="/organizations">
                      <HandHeart className="mr-2 h-4 w-4" />
                      Meet Our Organizations
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Bottom text */}
            <div className="text-center mt-12">
              <p className="text-sm text-white/80 max-w-xl mx-auto">
                Together, we can strengthen our community through education, leadership, and service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 