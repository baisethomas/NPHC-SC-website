import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { getEvents } from "@/lib/data";

const announcements = [
  {
    title: "Annual Scholarship Gala",
    date: "August 15, 2024",
    description: "Join us for our biggest fundraising event of the year. All proceeds go to our student scholarship fund."
  },
  {
    title: "New Member Intake",
    date: "July 30, 2024",
    description: "Several of our member organizations will be starting their new member intake process soon. Stay tuned for details."
  },
  {
    title: "Community Service Day",
    date: "July 20, 2024",
    description: "We're partnering with local charities for a county-wide day of service. Sign up to volunteer!"
  }
];

const organizations = [
  { logo: "https://placehold.co/100x100.png", name: "Alpha Kappa Alpha Sorority, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Alpha Phi Alpha Fraternity, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Delta Sigma Theta Sorority, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Zeta Phi Beta Sorority, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Iota Phi Theta Fraternity, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Kappa Alpha Psi Fraternity, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Sigma Gamma Rho Sorority, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Phi Beta Sigma Fraternity, Inc.", hint: "organization logo" },
  { logo: "https://placehold.co/100x100.png", name: "Omega Psi Phi Fraternity, Inc.", hint: "organization logo" },
];


export default function Home() {
  const events = getEvents().slice(0, 2);

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center text-white">
        <Image src="https://placehold.co/1200x600.png" alt="NPHC Solano County members" layout="fill" objectFit="cover" className="z-0" data-ai-hint="community gathering" />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="z-20 p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight">NPHC of Solano County</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
            Fostering brotherhood and sisterhood, scholarship, and service within the Solano County community.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg">
              The National Pan-Hellenic Council of Solano County is dedicated to "Unanimity of Thought and Action." We are committed to uplifting our community through service, promoting academic excellence, and creating a lasting legacy of unity and leadership among our member organizations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">News & Announcements</h2>
            <p className="text-muted-foreground mt-2">The latest updates from our council and member chapters.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {announcements.map((item, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{item.title}</CardTitle>
                  <CardDescription>{item.date}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p>{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">Upcoming Events</h2>
            <p className="text-muted-foreground mt-2">Join us at our next community event.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {events.map((event, index) => (
              <Card key={index} className="overflow-hidden">
                <Image src={event.image} alt={event.title} width={600} height={400} className="w-full h-60 object-cover" data-ai-hint={event.image_hint} />
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
                    <Link href="/events">Learn More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/events">View All Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold">Our Organizations</h2>
            <p className="text-muted-foreground mt-2">The Divine Nine chapters of Solano County.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center">
            {organizations.map((org, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <Image src={org.logo} alt={`${org.name} logo`} width={100} height={100} className="rounded-full mb-4" data-ai-hint={org.hint} />
                <p className="font-semibold text-sm">{org.name}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/organizations">Meet The Chapters <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
