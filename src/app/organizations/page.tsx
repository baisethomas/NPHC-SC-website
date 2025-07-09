import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Terminal } from "lucide-react";
import { getOrganizations } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function OrganizationsPage() {
  const { organizations, error } = await getOrganizations();

  return (
    <div>
      {/* Vibrant Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-transparent to-pink-600/20" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        
        <div className="container text-center relative z-10">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full text-white shadow-lg backdrop-blur-sm">
            <ArrowRight className="h-10 w-10 rotate-45" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white mb-4">Our Organizations</h1>
          <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
          <p className="mt-4 text-lg text-white/90 max-w-3xl mx-auto">
            Meet the Divine Nine organizations that form the foundation of the NPHC of Solano County. 
            Each chapter brings unique traditions, values, and contributions to our community.
          </p>
          
          {/* Divine Nine Badge */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white/90 text-sm font-medium">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            The Divine Nine Legacy
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          {error ? (
            <Alert variant="destructive" className="max-w-4xl mx-auto">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Organizations</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {organizations.map((org) => (
                <Card key={org.id} className="flex flex-col">
                  <CardHeader className="items-center text-center">
                    <Image src={org.logo} alt={`${org.name} logo`} width={200} height={200} className="h-28 w-28 object-contain mb-4" data-ai-hint={org.hint} />
                    <CardTitle className="font-headline text-2xl">{org.name}</CardTitle>
                    <CardDescription className="font-semibold">{org.chapter}</CardDescription>
                    <CardDescription>President: {org.president}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-center">
                      {org.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={org.link} target="_blank" rel="noopener noreferrer">
                        Visit Chapter Site <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
