import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBoardMembers } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Terminal, Target, Users, BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function AboutPage() {
  const { boardMembers, error } = await getBoardMembers();

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
            <Image src="https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/photos%2F485807499_4131253293764172_7067333595532137802_n.jpg?alt=media&token=b4e7804b-b196-4062-8330-364772ac8a9c" alt="Historical photo of NPHC members" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="group photo" />
          </div>
        </div>
      </section>

      {/* Vibrant Mission & Objectives Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-transparent to-blue-600/20" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full text-white shadow-lg backdrop-blur-sm">
              <Target className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4 text-white">Our Mission & Objectives</h2>
            <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">
              The purpose of the NPHC of Solano County is to foster cooperative actions of its members in dealing with matters of mutual concern. We promote the well-being of our affiliate fraternities and sororities, facilitate their development, and provide leadership training for our constituents.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  <AccordionItem value="item-1" className="border border-violet-100/50 rounded-xl px-6 py-2 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 hover:from-violet-50 hover:to-indigo-50 transition-all duration-300">
                    <AccordionTrigger className="font-semibold text-lg text-violet-800 hover:text-violet-900 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full text-white">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        Why Our Tradition Must Continue
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 space-y-4 pt-4 ml-11">
                      <p className="leading-relaxed">Each of the nine NPHC organizations evolved during a period when African Americans were being denied essential rights and privileges. Racial isolation and social barriers created a need for African Americans to align themselves with others sharing common goals and ideals.</p>
                      <p className="leading-relaxed">These Greek-lettered organizations became a haven and an outlet to foster brotherhood and sisterhood in the pursuit of social change. Today, in Solano County and across the nation, that need remains. The primary purpose of our member organizations is community awareness and action through educational, economic, and cultural service activities.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" className="border border-blue-100/50 rounded-xl px-6 py-2 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 hover:from-blue-50 hover:to-cyan-50 transition-all duration-300">
                    <AccordionTrigger className="font-semibold text-lg text-blue-800 hover:text-blue-900 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full text-white">
                          <Users className="h-4 w-4" />
                        </div>
                        A Lifetime Commitment
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 space-y-4 pt-4 ml-11">
                       <p className="leading-relaxed">Greek membership extends far beyond the collegiate experience—it is a lifetime commitment. Members are expected to align with a graduate/alumni chapter after college, taking an active part in matters concerning and affecting the community in which they live.</p>
                       <p className="leading-relaxed">Here in Solano County, NPHC promotes this lifelong interaction through forums, meetings, and cooperative programming, ensuring a lasting impact on our community.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                   <AccordionItem value="item-3" className="border border-emerald-100/50 rounded-xl px-6 py-2 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 hover:from-emerald-50 hover:to-teal-50 transition-all duration-300">
                    <AccordionTrigger className="font-semibold text-lg text-emerald-800 hover:text-emerald-900 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white">
                          <Target className="h-4 w-4" />
                        </div>
                        Core Objectives
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 space-y-4 pt-4 ml-11">
                      <ul className="space-y-3">
                        {objectives.map((objective, index) => (
                          <li key={index} className="flex items-start group">
                            <div className="flex items-center justify-center w-5 h-5 mr-3 mt-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shrink-0 group-hover:scale-110 transition-transform duration-200">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                            <span className="leading-relaxed group-hover:text-emerald-800 transition-colors duration-200">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">Executive Board</h2>
            <p className="text-muted-foreground mt-2">Meet the leaders guiding our council.</p>
          </div>
          {error ? (
             <Alert variant="destructive" className="max-w-2xl mx-auto">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Board Members</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {boardMembers.map((member) => (
                <Card key={member.id} className="text-center">
                  <CardHeader className="items-center">
                    <Avatar className="w-50 h-50 mb-4">
                      <AvatarImage src={member.image} alt={member.name} data-ai-hint={member.hint} />
                      <AvatarFallback className="text-2xl">{member.initials}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-xl">{member.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-primary/70 font-medium">{member.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
