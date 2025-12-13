import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, MapPin, Terminal, Mail, Heart } from "lucide-react";
import { getEvents, getAnnouncements, getBoardMembers } from "@/lib/data";
import { getDivineNineOrganizations, type DivineNineOrganization } from "@/lib/definitions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function Home() {
  const events = (await getEvents()).slice(0, 2);
  const { announcements, error: announcementsError } = await getAnnouncements();
  const latestAnnouncements = announcements.slice(0, 3);
  const { boardMembers } = await getBoardMembers();
  const president = boardMembers.find(member => member.title.toLowerCase() === 'president');
  const organizations: DivineNineOrganization[] = getDivineNineOrganizations();

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/photos%2F486065740_4131253287097506_5154761858775003667_n.jpg?alt=media&token=98ce7896-a868-4359-80d6-5177068e11df"
            alt="NPHC Solano County Community"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="z-20 p-4 relative w-full">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight animate-fade-in-up">NPHC of Solano County</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90 animate-fade-in-up animation-delay-200">
            Fostering brotherhood and sisterhood, scholarship, and service within the Solano County community.
          </p>
        </div>
      </section>

      {/* President's Message Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-headline font-bold mb-2">A Message from Our President</h2>
              <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            </div>
            
            <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Section */}
                  <div className="relative h-64 md:h-auto overflow-hidden">
                    {president ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={president.image}
                          alt={president.name}
                          fill
                          className="object-cover"
                          data-ai-hint={president.hint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-xl font-semibold mb-1">{president.name}</h3>
                          <p className="text-white/90">{president.title}</p>
                          <p className="text-white/70 text-sm">NPHC Solano County</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                        <div className="text-center text-white p-8">
                          <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <span className="text-4xl font-bold">PB</span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">President</h3>
                          <p className="text-blue-100">NPHC Solano County</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Section */}
                  <div className="p-8 md:p-12">
                    <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
                      &quot;Welcome to the National Pan-Hellenic Council of Solano County. Our organization stands as a beacon of unity, scholarship, and service in our community. 
                      
                      <br /><br />
                      
                      Through the collective strength of our Divine Nine organizations, we continue to foster brotherhood and sisterhood while making meaningful contributions to Solano County. Our commitment to academic excellence, community service, and leadership development remains unwavering.
                      
                      <br /><br />
                      
                      I invite you to join us in our mission to uplift our community and create lasting positive change. Together, we embody the true spirit of &apos;Unanimity of Thought and Action.&apos;&quot;
                    </blockquote>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-gradient-to-r from-yellow-400 to-yellow-600 flex-1"></div>
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Unity • Service • Excellence</span>
                      <div className="h-px bg-gradient-to-r from-yellow-400 to-yellow-600 flex-1"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-yellow-190">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold mb-2">Our Mission</h2>
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-muted-foreground text-lg">
              The National Pan-Hellenic Council of Solano County is dedicated to &quot;Unanimity of Thought and Action.&quot; We are committed to uplifting our community through service, promoting academic excellence, and creating a lasting legacy of unity and leadership among our member organizations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold mb-2">Latest News</h2>
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-muted-foreground mt-2">The latest updates from our council and member chapters.</p>
          </div>
          
          {announcementsError ? (
            <Alert variant="destructive" className="max-w-xl mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Announcements</AlertTitle>
              <AlertDescription>
                Could not fetch announcements from the database. This may be due to a configuration issue.
              </AlertDescription>
            </Alert>
          ) : latestAnnouncements.length > 0 ? (
            <>
              <div className="grid gap-8 md:grid-cols-3">
                {latestAnnouncements.map((item) => (
                  <Card key={item.id} className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
                    <CardHeader>
                      <CardTitle className="text-xl font-headline">
                         <Link href={`/news/${item.id}`} className="hover:underline">{item.title}</Link>
                      </CardTitle>
                      <CardDescription>{item.date}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="line-clamp-4 text-muted-foreground">{item.description}</p>
                    </CardContent>
                    <CardFooter>
                       <Button asChild variant="link" className="p-0 h-auto font-semibold">
                         <Link href={`/news/${item.id}`}>Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                       </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild className="transition-transform duration-300 ease-in-out hover:scale-105">
                  <Link href="/news">View All News <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">There are no announcements at this time.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold mb-2">Upcoming Events</h2>
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-muted-foreground mt-2">Join us at our next community event.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {events.map((event, index) => (
              <Card key={index} className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
                <div className="w-full h-80 bg-muted relative">
                  <Image src={event.image} alt={event.title} fill className="p-4 object-contain" data-ai-hint={event.image_hint} />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline">
                    <Link href={`/events/${event.slug}`}>Learn More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild className="transition-transform duration-300 ease-in-out hover:scale-105">
              <Link href="/events">View All Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold mb-2">The Divine Nine</h2>
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nine historically Black Greek-letter organizations united in service, scholarship, and sisterhood/brotherhood.
            </p>
          </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12 items-start justify-center">
              {organizations.map((org, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="relative">
                    {/* Subtle colored background that appears on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 to-purple-100/0 group-hover:from-blue-100/60 group-hover:to-purple-100/60 rounded-2xl transition-all duration-500 ease-in-out transform group-hover:scale-110" />
                    <div className="relative flex items-center justify-center h-32 p-4 transition-transform duration-300 ease-in-out group-hover:-translate-y-2">
                      <Image src={org.logo} alt={`${org.name} logo`} width={200} height={200} className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-105" data-ai-hint={org.hint} />
                    </div>
                  </div>
                  <p className="mt-4 font-semibold text-sm h-10 group-hover:text-primary transition-colors duration-300">{org.name}</p>
                </div>
              ))}
            </div>
          <div className="text-center mt-12">
            <Button asChild className="transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl">
              <Link href="/organizations">Meet The Chapters <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-teal-500/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold mb-2 text-white">Stay Connected & Support Our Mission</h2>
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Join our community and help us continue making a positive impact in Solano County.
            </p>
          </div>
          
          {/* Hidden for live deployment - available on development branch */}
          {/* <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white shadow-lg group-hover:shadow-cyan-500/25 transition-shadow duration-300">
                  <Mail className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-headline text-center bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Join Our Mailing List</CardTitle>
                <CardDescription className="text-center text-base text-gray-600">
                  Stay updated with the latest events, news, and community initiatives from NPHC Solano County.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 text-center">
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-cyan-500 font-bold">✓</span> Event announcements and updates
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-cyan-500 font-bold">✓</span> Community news and achievements
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-cyan-500 font-bold">✓</span> Scholarship opportunities
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-cyan-500 font-bold">✓</span> Volunteer opportunities
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="relative z-10 flex justify-center">
                <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 ease-in-out hover:scale-105 shadow-lg hover:shadow-cyan-500/25 text-white font-semibold">
                  <Link href="/mailing-list">
                    <Mail className="mr-2 h-4 w-4" />
                    Subscribe Now
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-red-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-400 to-red-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-red-600 rounded-full text-white shadow-lg group-hover:shadow-pink-500/25 transition-shadow duration-300">
                  <Heart className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-headline text-center bg-gradient-to-r from-pink-600 to-red-700 bg-clip-text text-transparent">Support Our Community</CardTitle>
                <CardDescription className="text-center text-base text-gray-600">
                  Your generous donations help us continue our mission of service, scholarship, and unity.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 text-center">
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-pink-500 font-bold">✓</span> Fund youth mentorship programs
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-pink-500 font-bold">✓</span> Support educational scholarships
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-pink-500 font-bold">✓</span> Enable community outreach events
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-pink-500 font-bold">✓</span> Strengthen our local chapters
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="relative z-10 flex justify-center">
                <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 transition-all duration-300 ease-in-out hover:scale-105 shadow-lg hover:shadow-pink-500/25 text-white font-semibold">
                  <Link href="/donations">
                    <Heart className="mr-2 h-4 w-4" />
                    Donate Today
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div> */}

          {/* Bottom text */}
          <div className="text-center mt-12">
            <p className="text-sm text-white/80 max-w-xl mx-auto">
              Together, we can continue building a stronger, more unified community throughout Solano County.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
