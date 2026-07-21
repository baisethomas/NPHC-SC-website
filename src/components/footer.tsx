import { Facebook, Instagram, Twitter } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();

  const socialLinks = [
    { label: "Facebook", href: settings.facebookUrl, Icon: Facebook },
    { label: "Instagram", href: settings.instagramUrl, Icon: Instagram },
    { label: "Twitter", href: settings.twitterUrl, Icon: Twitter },
  ].filter((link) => link.href !== "");

  const footerText =
    settings.footerText || "NPHC of Solano County. All Rights Reserved.";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm">&copy; {currentYear} {footerText}</p>
          </div>
          {socialLinks.length > 0 && (
            <div className="flex items-center space-x-4">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
