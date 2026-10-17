import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "./contact-form";

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
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm presetSubject={presetSubject} />
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <p className="eyebrow mb-4">Contact information</p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${settings.contactEmail}`} className="break-all hover:underline underline-offset-4">
                  {settings.contactEmail}
                </a>
              </li>
              {settings.contactPhone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <a href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`} className="hover:underline underline-offset-4">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings.mailingAddress && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <p className="whitespace-pre-line">{settings.mailingAddress}</p>
                </li>
              )}
            </ul>
            {settings.meetingCadence && (
              <div className="mt-8 rounded-lg border border-border bg-card p-5">
                <p className="eyebrow mb-2">Council meetings</p>
                <p className="text-sm leading-relaxed">{settings.meetingCadence}</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
