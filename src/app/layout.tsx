import type { Metadata } from "next";
import { Instrument_Sans, Big_Shoulders } from 'next/font/google';
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

// Headlines: a tall condensed grotesque. Civic, collegiate, and loud at
// display sizes, without the "AI site" serif.
const fontHeadline = Big_Shoulders({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-headline',
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
        fontHeadline.variable
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
