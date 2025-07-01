import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const organizations = [
  {
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "The first intercollegiate historically African American Greek-lettered sorority.",
    chapter: "Mu Eta Omega Chapter",
    link: "#",
  },
  {
    name: "Alpha Phi Alpha Fraternity, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "The first intercollegiate Greek-letter fraternity established for African American Men.",
    chapter: "Zeta Beta Lambda Chapter",
    link: "#",
  },
  {
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "An organization of college educated women committed to the constructive development of its members and to public service.",
    chapter: "Fairfield-Suisun Valley Alumnae Chapter",
    link: "#",
  },
  {
    name: "Zeta Phi Beta Sorority, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "A community-conscious, action-oriented organization founded on the principles of Scholarship, Service, Sisterhood and Finer Womanhood.",
    chapter: "Tau Alpha Zeta Chapter",
    link: "#",
  },
  {
    name: "Iota Phi Theta Fraternity, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "Committed to the development and perpetuation of Scholarship, Leadership, Citizenship, Fidelity, and Brotherhood among Men.",
    chapter: "Alpha Pi Omega Chapter",
    link: "#",
  },
  {
    name: "Kappa Alpha Psi Fraternity, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "A collegiate Greek-letter fraternity with a predominantly African-American membership, focused on achievement in every field of human endeavor.",
    chapter: "Fairfield-Vacaville Alumni Chapter",
    link: "#",
  },
  {
    name: "Sigma Gamma Rho Sorority, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "A leading historically Black Greek-letter sorority that aims to enhance the quality of life for women and their families in the U.S. and globally.",
    chapter: "Lambda Rho Sigma Chapter",
    link: "#",
  },
  {
    name: "Phi Beta Sigma Fraternity, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "An international organization of college and professional men, founded on the principles of Brotherhood, Scholarship and Service.",
    chapter: "Kappa Iota Sigma Chapter",
    link: "#",
  },
    {
    name: "Omega Psi Phi Fraternity, Inc.",
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
    description: "The first international fraternal organization founded on the campus of a historically black college, based on Friendship, Manhood, Scholarship, and Perseverance.",
    chapter: "Nu Phi Chapter",
    link: "#",
  },
];

export default function OrganizationsPage() {
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
