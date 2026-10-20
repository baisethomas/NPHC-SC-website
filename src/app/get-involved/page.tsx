import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/page-hero";
import { DivineNineChips } from "@/components/site/divine-nine-tiles";

const STEPS = [
  { title: "Learn the nine", text: "Read about each organization and its programs. Membership is a lifetime commitment, so take your time." },
  { title: "Come to an event", text: "Council and chapter events are open to the public. It is the best way to meet members." },
  { title: "Attend an interest meeting", text: "Each chapter schedules its own informational sessions. We will point you to the right one." },
  { title: "Apply through the chapter", text: "Intake, requirements, and timing are set by each organization, not the council." },
];

export default async function GetInvolvedPage() {
  const { donationUrl } = await getSiteSettings();

  const paths = [
    {
      n: "01",
      title: "Join a chapter",
      text: "Membership runs through the nine organizations, not the council. See who is active in Solano and how intake works.",
      cta: { href: "#join", label: "How membership works" },
      chips: true,
    },
    {
      n: "02",
      title: "Volunteer at an event",
      text: "Food drives, health fairs, back-to-school events, and mentoring. Chapters always need hands, and you do not have to be a member.",
      cta: { href: "/contact?subject=Volunteer", label: "Offer your time" },
    },
    {
      n: "03",
      title: "Partner with the council",
      text: "Schools, churches, and businesses that want to co-host a program, sponsor an event, or reach the Divine Nine community in Solano.",
      cta: { href: "/contact?subject=Partnership", label: "Start a conversation" },
    },
    {
      n: "04",
      title: "Support the work",
      text: "Fund scholarships and youth programs, or sponsor an event. Every gift stays in Solano County.",
      cta: donationUrl ? { href: donationUrl, label: "Donate online", external: true } : { href: "/donations", label: "Ways to give" },
    },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Get involved"
        title="Four ways in."
        lede="Whether you want to join a chapter, give a Saturday to a service project, or put your organization behind the work, start here."
      />

      {/* Paths: numbered editorial rows */}
      <section className="py-12 md:py-20">
        <div className="container">
          <ol className="divide-y divide-border border-y border-border">
            {paths.map((p) => (
              <li key={p.n} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
                <span className="font-headline text-3xl font-bold tabular-nums text-gold md:col-span-1 md:text-4xl">{p.n}</span>
                <div className="md:col-span-7">
                  <h2 className="font-headline text-2xl font-bold leading-tight md:text-3xl">{p.title}</h2>
                  <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{p.text}</p>
                  {p.chips && (
                    <p className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                      <DivineNineChips /> Nine organizations, each with a Solano chapter
                    </p>
                  )}
                </div>
                <div className="md:col-span-4 md:flex md:items-start md:justify-end">
                  <Button asChild variant="outline">
                    {p.cta.external ? (
                      <a href={p.cta.href} target="_blank" rel="noopener noreferrer">
                        {p.cta.label} <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link href={p.cta.href}>
                        {p.cta.label} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Joining a chapter */}
      <section id="join" className="scroll-mt-24 bg-ink py-16 text-ivory md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">
              The path into a Divine Nine organization
            </h2>
            <p className="mt-5 leading-relaxed text-ivory/70">
              The council does not run membership intake. Each of the nine organizations sets its own requirements, timing, and process, and most require a completed degree for alumni chapters. What the council can do is introduce you to the right chapter and tell you when interest meetings are coming up.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                <Link href="/organizations">
                  See the chapters <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
                <Link href="/contact?subject=Membership%20interest">Ask about a chapter</Link>
              </Button>
            </div>
          </div>
          <ol className="divide-y divide-ivory/10 border-y border-ivory/10 lg:col-span-7">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-4 py-6 md:grid-cols-[4rem_1fr]">
                <span className="font-headline text-2xl font-bold tabular-nums text-gold md:text-3xl">0{i + 1}</span>
                <div>
                  <h3 className="font-headline text-xl font-bold leading-snug md:text-2xl">{s.title}</h3>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-ivory/65 md:text-base">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Mailing list */}
      <section className="bg-gold-soft py-16 md:py-24">
        <div className="container grid items-center gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">Hear about events and deadlines first.</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/75 md:text-lg">
              A few emails a month. Event announcements, scholarship deadlines, and council news.
            </p>
          </div>
          <div className="md:col-span-4 md:flex md:justify-end">
            <Button asChild size="lg" className="bg-ink text-ivory hover:bg-ink/90">
              <Link href="/mailing-list">
                Join the mailing list <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
