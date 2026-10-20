import type { Metadata } from "next";
import { Instrument_Sans, Newsreader, Source_Serif_4 } from 'next/font/google';
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

// Headlines: Newsreader, an academic serif with optical sizes. Set light at
// display sizes (close to Caslon's color) and medium for section and card
// titles; see .font-headline in globals.css.
const fontHeadline = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-headline',
  display: 'swap',
});

// Greek lettermarks (ΑΚΑ, ΩΨΦ…): next/font does not ship Newsreader's Greek
// subset, so the letters get a serif that has one. Keeps them identical on
// every device instead of falling back to whatever serif is installed.
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
