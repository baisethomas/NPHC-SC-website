import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getOrganizations } from "@/lib/data";

export default function OrganizationsPage() {
  const organizations = getOrganizations();

  return (
    <div>
      <section className="bg-muted py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Organizations</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            The Divine Nine organizations that form the foundation of the NPHC of Solano County.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
              <Card key={org.name} className="flex flex-col">
                <CardHeader className="items-center text-center">
                  <Image src={org.logo} alt={`${org.name} logo`} width={100} height={100} className="mb-4 rounded-full" data-ai-hint={org.hint} />
                  <CardTitle className="font-headline text-2xl">{org.name}</CardTitle>
                  <CardDescription className="font-semibold">{org.chapter}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-center">
                    {org.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={org.link}>
                      Visit Chapter Site <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
