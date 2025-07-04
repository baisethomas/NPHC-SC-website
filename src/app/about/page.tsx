import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBoardMembers } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";

export default function AboutPage() {
  const boardMembers = getBoardMembers();

  const objectives = [
    "Assist in establishing and facilitating local councils on campuses and within communities.",
    "Serve as the communication link between constituent fraternities and sororities.",
    "Conduct periodic workshops and training sessions for local council officers.",
    "Host a NPHC National Convention/Undergraduate Leadership Conference.",
    "Work cooperatively with and contribute to other community groups and national organizations.",
    "Provide unity and economic empowerment through and by member organizations.",
    "Perform coordinating functions as set forth within the NPHC Constitution and Bylaws.",
  ];

  return (
    <div>
      <section className="bg-muted py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">About NPHC Solano</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Learn about our dedication to scholarship, service, and unity across Solano County.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid md:grid-cols-5 gap-12">
          <div className="md:col-span-3">
            <h2 className="text-3xl font-headline font-bold mb-4">Our Rich History</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The National Pan-Hellenic Council (NPHC) was founded on May 10, 1930, at Howard University in Washington, DC, to foster cooperative action among its members. The chartering organizations were Alpha Kappa Alpha, Delta Sigma Theta, Zeta Phi Beta, Kappa Alpha Psi, and Omega Psi Phi. They were soon joined by Alpha Phi Alpha and Phi Beta Sigma in 1931, Sigma Gamma Rho in 1937, and Iota Phi Theta in 1997, completing the Divine Nine.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Solano County chapter was chartered to bring this powerful legacy to our local community. Since our inception, we have worked tirelessly to unite these historically Black Greek-letter organizations in the area, creating a formidable force for positive change, community empowerment, and cultural enrichment throughout Solano County.
            </p>
          </div>
          <div className="md:col-span-2">
            <Image src="https://placehold.co/600x400.png" alt="Historical photo of NPHC members" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="historic photo" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-headline font-bold mb-4">Our Mission & Objectives</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The purpose of the NPHC of Solano County is to foster cooperative actions of its members in dealing with matters of mutual concern. We promote the well-being of our affiliate fraternities and sororities, facilitate their development, and provide leadership training for our constituents.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold text-lg">Why Our Tradition Must Continue</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground space-y-4 pt-4">
                    <p>Each of the nine NPHC organizations evolved during a period when African Americans were being denied essential rights and privileges. Racial isolation and social barriers created a need for African Americans to align themselves with others sharing common goals and ideals.</p>
                    <p>These Greek-lettered organizations became a haven and an outlet to foster brotherhood and sisterhood in the pursuit of social change. Today, in Solano County and across the nation, that need remains. The primary purpose of our member organizations is community awareness and action through educational, economic, and cultural service activities.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-semibold text-lg">A Lifetime Commitment</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground space-y-4 pt-4">
                     <p>Greek membership extends far beyond the collegiate experience—it is a lifetime commitment. Members are expected to align with a graduate/alumni chapter after college, taking an active part in matters concerning and affecting the community in which they live.</p>
                     <p>Here in Solano County, NPHC promotes this lifelong interaction through forums, meetings, and cooperative programming, ensuring a lasting impact on our community.</p>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                  <AccordionTrigger className="font-semibold text-lg">Core Objectives</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground space-y-4 pt-4">
                    <ul className="space-y-3">
                      {objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 mr-3 mt-1 text-primary shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">Executive Board</h2>
            <p className="text-muted-foreground mt-2">Meet the leaders guiding our council.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {boardMembers.map((member) => (
              <Card key={member.name} className="text-center">
                <CardHeader className="items-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={member.image} alt={member.name} data-ai-hint={member.hint} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-headline text-xl">{member.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary/70 font-medium">{member.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
