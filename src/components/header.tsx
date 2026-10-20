"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Heart, UserCircle, ShieldCheck, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/organizations", label: "Chapters" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/get-involved", label: "Get Involved" },
];

// Tokened download URL: Storage rules are admin-only, so public reads must
// carry the object's download token (tokens bypass rules).
const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FNPHC-Official-Logo-sq.png?alt=media&token=d7a5c6b7-4460-492b-871f-13bd90b64da7";

export function Header({ donateHref = "/donations" }: { donateHref?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, roles, membershipApproved } = useAuth();

  const isStaff = roles.some((role) => role !== "visitor" && role !== "member");
  const portalHref = isStaff ? "/admin" : membershipApproved ? "/members" : null;
  const portalLabel = isStaff ? "Admin" : "Member Portal";
  const PortalIcon = isStaff ? ShieldCheck : UserCircle;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // A signed-in user who is not yet approved cannot reach either portal shell,
  // which are the only other places with a sign-out control. Give them one here.
  const awaitingApproval = !loading && !!user && !portalHref;
  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="NPHC of Solano County home">
          <Image src={LOGO_URL} alt="" width={44} height={44} className="h-11 w-11 object-contain" priority />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-headline text-base font-bold tracking-tight">NPHC Solano County</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Nine Legacies · One Council</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-gold after:transition-transform after:duration-200 after:content-['']",
                isActive(link.href)
                  ? "text-foreground after:scale-x-100"
                  : "text-foreground/65 after:origin-left after:scale-x-0 hover:after:scale-x-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!loading && user && portalHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={portalHref}>
                <PortalIcon className="h-4 w-4" />
                {portalLabel}
              </Link>
            </Button>
          ) : awaitingApproval ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} title="Your membership is awaiting approval">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : (
            !loading && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Member Login</Link>
              </Button>
            )
          )}
          <Button asChild size="sm" className="bg-gold text-ink hover:bg-gold/90">
            <Link href={donateHref}>
              <Heart className="h-4 w-4" />
              Donate
            </Link>
          </Button>
        </div>

        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[300px] flex-col bg-background p-0 sm:w-[360px]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <div className="flex items-center gap-3 border-b border-border p-4">
                <Image src={LOGO_URL} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                <div className="leading-tight">
                  <p className="font-headline font-bold">NPHC Solano County</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Nine Legacies · One Council</p>
                </div>
              </div>
              <nav className="flex flex-1 flex-col p-2" aria-label="Mobile">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={cn("rounded-md px-3 py-3 text-base font-medium", pathname === "/" ? "bg-secondary" : "hover:bg-secondary")}
                >
                  Home
                </Link>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn("rounded-md px-3 py-3 text-base font-medium", isActive(link.href) ? "bg-secondary" : "hover:bg-secondary")}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2 border-t border-border p-4">
                <Button asChild className="bg-gold text-ink hover:bg-gold/90">
                  <Link href={donateHref} onClick={() => setIsOpen(false)}>
                    <Heart className="h-4 w-4" />
                    Donate
                  </Link>
                </Button>
                {!loading && user && portalHref ? (
                  <Button asChild variant="outline">
                    <Link href={portalHref} onClick={() => setIsOpen(false)}>
                      <PortalIcon className="h-4 w-4" />
                      {portalLabel}
                    </Link>
                  </Button>
                ) : awaitingApproval ? (
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/login" onClick={() => setIsOpen(false)}>Member Login</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
