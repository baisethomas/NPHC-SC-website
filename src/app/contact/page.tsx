import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "./contact-form";

const SERVICE_AREA = ["Vallejo", "Fairfield", "Vacaville", "Benicia", "Suisun City", "Dixon", "Rio Vista"];

const SUBJECTS = [
  { label: "Membership interest", subject: "Membership interest" },
  { label: "Volunteer or partner", subject: "Volunteer or partnership" },
  { label: "Sponsorship", subject: "Sponsorship" },
  { label: "Scholarship question", subject: "Scholarship question" },
  { label: "Share event photos", subject: "Photos" },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const [settings, { subject }] = await Promise.all([getSiteSettings(), searchParams]);
  const presetSubject = typeof subject === "string" ? subject.slice(0, 200) : "";

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Reach the council."
        lede="Questions, partnership ideas, membership interest, or a note for the executive board. Messages go straight to the council inbox."
      />

      <section className="py-16 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ContactForm presetSubject={presetSubject} />
          </div>

          <aside className="lg:col-span-5 lg:col-start-8">
            <dl className="divide-y divide-border border-y border-border">
              <div className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${settings.contactEmail}`} className="break-all font-semibold hover:underline underline-offset-4">
                    {settings.contactEmail}
                  </a>
                </dd>
              </div>
              {settings.contactPhone && (
                <div className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Phone</dt>
                  <dd>
                    <a href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`} className="font-semibold hover:underline underline-offset-4">
                      {settings.contactPhone}
                    </a>
                  </dd>
                </div>
              )}
              {settings.mailingAddress && (
                <div className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mail</dt>
                  <dd className="whitespace-pre-line">{settings.mailingAddress}</dd>
                </div>
              )}
              {settings.meetingCadence && (
                <div className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Meetings</dt>
                  <dd className="leading-relaxed">{settings.meetingCadence}</dd>
                </div>
              )}
              <div className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Serving</dt>
                <dd className="leading-relaxed">{SERVICE_AREA.join(", ")}</dd>
              </div>
            </dl>

            <div className="mt-10">
              <p className="eyebrow mb-3">Common reasons to write</p>
              <ul className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <li key={s.subject}>
                    <Link
                      href={`/contact?subject=${encodeURIComponent(s.subject)}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-gold hover:bg-gold-soft"
                    >
                      {s.label} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
