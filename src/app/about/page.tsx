import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const boardMembers = [
  { name: "Eleanor Vance", title: "President", initials: "EV", image: "https://placehold.co/100x100.png", hint: "headshot person" },
  { name: "Marcus Thorne", title: "Vice President", initials: "MT", image: "https://placehold.co/100x100.png", hint: "professional headshot" },
  { name: "Seraphina Cruz", title: "Secretary", initials: "SC", image: "https://placehold.co/100x100.png", hint: "person smiling" },
  { name: "Julian Hayes", title: "Treasurer", initials: "JH", image: "https://placehold.co/100x100.png", hint: "corporate headshot" },
  { name: "Isabella Chen", title: "Parliamentarian", initials: "IC", image: "https://placehold.co/100x100.png", hint: "professional person" },
  { name: "David Rodriguez", title: "Director of Community Service", initials: "DR", image: "https://placehold.co/100x100.png", hint: "person outdoors" },
];

export default function AboutPage() {
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
            <h2 className="text-3xl font-headline font-bold mb-4">Our History</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The National Pan-Hellenic Council (NPHC) was founded on May 10, 1930, at Howard University, with the purpose of fostering cooperative actions of its members in dealing with matters of mutual concern. For decades, the NPHC has been at the forefront of social action, academic achievement, and community service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Solano County chapter was chartered to bring this powerful legacy to our local community. Since our inception, we have worked tirelessly to unite the historically Black Greek-letter organizations in the area, creating a formidable force for positive change, community empowerment, and cultural enrichment throughout Solano County.
            </p>
          </div>
          <div className="md:col-span-2">
            <Image src="https://placehold.co/600x400.png" alt="Historical photo of NPHC members" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="historic photo" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold mb-4">Our Purpose</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The purpose of the NPHC of Solano County shall be to foster cooperative actions of its members in dealing with matters of mutual concern. To this end, the NPHC promotes the well-being of its affiliate fraternities and sororities, facilitates the establishment and development of local councils of the NPHC and provides leadership training for its constituents.
            </p>
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
