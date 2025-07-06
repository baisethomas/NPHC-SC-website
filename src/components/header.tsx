
"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const baseNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/organizations", label: "Organizations" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact Us" },
];

const logoUrl = "https://www.nphchq.com/wp-content/uploads/2020/04/NPHC-Official-Logo-sq.png";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="h-[5px] w-full bg-primary" />
      <div className="container flex h-32 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src={logoUrl} alt="NPHC Solano Logo" width={128} height={128} className="h-28 w-auto" />
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium">
            {baseNavLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === link.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
             {!loading && user && (
                <Link href="/admin" className={cn("transition-colors hover:text-foreground/80", pathname.startsWith("/admin") ? "text-foreground" : "text-foreground/60")}>
                  Admin
                </Link>
            )}
          </nav>
          {!loading && (
            user ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">A list of links to navigate the site.</SheetDescription>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <Image src={logoUrl} alt="NPHC Solano Logo" width={80} height={80} />
                    <span className="font-bold font-headline text-lg">NPHC Solano</span>
                  </Link>
                </div>
                <nav className="flex flex-col items-start space-y-1 p-4">
                  {baseNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary rounded-md px-3 py-2 w-full",
                        pathname === link.href && "bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!loading && user && (
                     <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary rounded-md px-3 py-2 w-full",
                        pathname.startsWith("/admin") && "bg-muted"
                      )}
                    >
                      Admin
                    </Link>
                  )}
                </nav>
                <div className="mt-auto p-4 border-t">
                  {!loading && (
                    user ? (
                      <Button onClick={handleLogout} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/login">Login</Link>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
