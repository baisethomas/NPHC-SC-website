import type { Metadata } from "next";
import { Inter, Playfair_Display } from 'next/font/google';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const fontBody = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  weight: '700',
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
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
