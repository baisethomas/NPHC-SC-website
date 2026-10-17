import Link from "next/link";
import { ArrowRight, ArrowUpRight, Handshake, Heart, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";

const STEPS = [
  { n: 1, title: "Learn the nine", text: "Read about each organization and its programs. Membership is a lifetime commitment, so take your time." },
  { n: 2, title: "Come to an event", text: "Council and chapter events are open to the public. It is the best way to meet members." },
  { n: 3, title: "Attend an interest meeting", text: "Each chapter schedules its own informational sessions. We will point you to the right one." },
  { n: 4, title: "Apply through the chapter", text: "Intake, requirements, and timing are set by each organization, not the council." },
];

export default async function GetInvolvedPage() {
  const { donationUrl } = await getSiteSettings();

  return (
    <div>
      <PageHero
        eyebrow="Get involved"
        title="Three ways in."
        lede="Whether you are looking to join a chapter, volunteer at an event, or put your business behind the work, start here."
      />

      <section className="py-16 md:py-24">
        <div className="container grid gap-6 md:grid-cols-3">
          <Door
            icon={Users}
            title="Join a chapter"
            text="Membership runs through the nine organizations. See who is active in Solano and how intake works."
            cta={{ href: "#join", label: "How membership works" }}
          />
          <Door
            icon={Handshake}
            title="Volunteer or partner"
            text="Schools, churches, businesses, and individuals who want to help with programs and events."
            cta={{ href: "/contact?subject=Volunteer%20or%20partnership", label: "Contact the council" }}
          />
          <Door
            icon={Heart}
            title="Support the work"
            text="Fund scholarships and youth programs, or sponsor an event."
            cta={donationUrl ? { href: donationUrl, label: "Donate online", external: true } : { href: "/donations", label: "Ways to give" }}
          />
        </div>
      </section>

      <section id="join" className="border-t border-border bg-card py-16 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Joining a chapter" title="The path into a Divine Nine organization" className="mb-4" />
            <p className="leading-relaxed text-muted-foreground">
              The council does not run membership intake. Each of the nine organizations sets its own requirements, timing, and process, and most require a completed degree for alumni chapters. What the council can do is introduce you to the right chapter and tell you when interest meetings are coming up.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/organizations">
                  See the chapters <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact?subject=Membership%20interest">Ask about a chapter</Link>
              </Button>
            </div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-5 border-t border-border py-5 first:border-t-0 first:pt-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-headline text-sm font-bold text-gold">{s.n}</span>
                <div>
                  <p className="font-headline text-lg font-bold">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Stay in the loop"
            title="Hear about events and deadlines first."
            lede="A few emails a month. Event announcements, scholarship deadlines, and council news."
          />
          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
              <Link href="/mailing-list">
                <Mail className="h-4 w-4" /> Join the mailing list
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Door({
  icon: Icon,
  title,
  text,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  cta: { href: string; label: string; external?: boolean };
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-headline text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <div className="mt-auto pt-6">
        <Button asChild variant="outline" size="sm">
          {cta.external ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer">
              {cta.label} <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <Link href={cta.href}>
              {cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
