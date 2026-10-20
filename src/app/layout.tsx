import type { Metadata } from "next";
import { Instrument_Sans, Bricolage_Grotesque, Source_Serif_4 } from 'next/font/google';
import { SiteChrome } from "@/components/site-chrome";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

// Body: a humanist grotesque with a little warmth, so copy does not read as
// the default system-sans of every generated site.
const fontBody = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Headlines: a grotesque with optical sizes, so it is tight and characterful
// at display sizes and still clean at card-title sizes. Not the "AI site" serif.
const fontHeadline = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-headline',
  display: 'swap',
});

// Greek lettermarks (ΑΚΑ, ΩΨΦ…): neither headline nor body face ships Greek
// glyphs, so without this they fall back to whatever the device has. A serif
// with real Greek keeps them identical on every platform.
const fontGreek = Source_Serif_4({
  subsets: ['greek', 'latin'],
  weight: ['600', '700'],
  variable: '--font-greek',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "NPHC Solano Hub",
  description: "The official website for the National Pan-Hellenic Council of Solano County.",
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn(
        "font-body antialiased",
        fontBody.variable,
        fontHeadline.variable,
        fontGreek.variable
      )}>
        <AuthProvider>
          <SiteChrome header={<Header />} footer={<Footer />}>
            {children}
          </SiteChrome>
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
