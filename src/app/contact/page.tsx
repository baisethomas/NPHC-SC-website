import { Mail, MapPin, Phone } from "lucide-react";

import { getSiteSettings } from "@/lib/site-settings";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <section className="bg-muted py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            We&apos;d love to hear from you. Whether you have a question, a suggestion, or a partnership inquiry, please reach out.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid md:grid-cols-3 gap-16">
          <div className="md:col-span-2">
            <ContactForm />
          </div>
          <div className="space-y-8">
            <h3 className="font-headline text-2xl font-bold">Contact Information</h3>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary"/>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary">
                  {settings.contactEmail}
                </a>
              </div>
              {settings.contactPhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary"/>
                  <a
                    href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`}
                    className="hover:text-primary"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              )}
              {settings.mailingAddress && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0"/>
                  <p className="whitespace-pre-line">{settings.mailingAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
