"use client";

import Link from "next/link";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/members", label: "Members" },
];

const contactLinks = [
  { href: "/contact", label: "Contact Us" },
  { href: "/mailing-list", label: "Mailing List" },
  { href: "/donations", label: "Donations" },
];

const logoUrl = "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FNPHC-Official-Logo-sq.png?alt=media";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full border-b sticky top-0 z-50 lg:static lg:top-auto lg:z-auto">
      <div className="h-[15px] w-full bg-black" />
      <div className="container flex h-20 lg:h-32 mobile-landscape-compact items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src={logoUrl} alt="NPHC Solano Logo" width={128} height={128} className="h-16 lg:h-28 w-auto mobile-landscape-logo" />
        </Link>
        
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium">
            {baseNavLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "relative px-3 py-2 transition-all duration-300 ease-in-out hover:scale-105 hover:text-foreground group overflow-hidden",
                  pathname === link.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                <span className="relative z-10">{link.label}</span>
                {/* Animated underline */}
                <div className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ease-out",
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 scale-0 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </Link>
            ))}
            
            {/* Contact Us Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "relative px-3 py-2 transition-all duration-300 ease-in-out hover:scale-105 hover:text-foreground group overflow-hidden flex items-center gap-1",
                  (pathname === "/contact" || pathname === "/mailing-list" || pathname === "/donations") ? "text-foreground" : "text-foreground/60"
                )}>
                  <span className="relative z-10">Contact Us</span>
                  <ChevronDown className="h-3 w-3 relative z-10" />
                  {/* Animated underline */}
                  <div className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ease-out",
                    (pathname === "/contact" || pathname === "/mailing-list" || pathname === "/donations") ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                  {/* Subtle background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 scale-0 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {contactLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="w-full cursor-pointer">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
             {!loading && user && (
                <Link 
                  href="/admin" 
                  className={cn(
                    "relative px-3 py-2 transition-all duration-300 ease-in-out hover:scale-105 hover:text-foreground group overflow-hidden",
                    pathname.startsWith("/admin") ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <span className="relative z-10">Admin</span>
                  {/* Animated underline */}
                  <div className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ease-out",
                    pathname.startsWith("/admin") ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                  {/* Subtle background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 scale-0 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
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

        <div className="lg:hidden">
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
                        "relative text-lg font-medium transition-all duration-300 ease-in-out hover:translate-x-2 hover:text-primary rounded-md px-3 py-2 w-full group overflow-hidden",
                        pathname === link.href && "bg-muted"
                      )}
                    >
                      <span className="relative z-10">{link.label}</span>
                      {/* Sliding background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                      {/* Left border accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out origin-center" />
                      {/* Pulse effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 to-yellow-600/40 rounded-md transform scale-95 opacity-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-400 ease-out" />
                      {/* Diagonal sweep */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-0 transition-transform duration-600 ease-in-out" />
                    </Link>
                  ))}
                  
                  {/* Contact & Support section in mobile */}
                  <div className="w-full mt-4">
                    <div className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Contact & Support
                    </div>
                    <div className="space-y-1">
                      {contactLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "relative text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 hover:text-primary rounded-md px-6 py-3 w-full group overflow-hidden block",
                            pathname === link.href && "bg-muted text-primary"
                          )}
                        >
                          <span className="relative z-10">{link.label}</span>
                          {/* Sliding background effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                          {/* Left border accent */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out origin-center" />
                          {/* Pulse effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 to-yellow-600/40 rounded-md transform scale-95 opacity-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-400 ease-out" />
                          {/* Diagonal sweep */}
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-0 transition-transform duration-600 ease-in-out" />
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {!loading && user && (
                     <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "relative text-lg font-medium transition-all duration-300 ease-in-out hover:translate-x-2 hover:text-primary rounded-md px-3 py-2 w-full group overflow-hidden",
                        pathname.startsWith("/admin") && "bg-muted"
                      )}
                    >
                      <span className="relative z-10">Admin</span>
                      {/* Sliding background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                      {/* Left border accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out origin-center" />
                      {/* Pulse effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 to-yellow-600/40 rounded-md transform scale-95 opacity-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-400 ease-out" />
                      {/* Diagonal sweep */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-0 transition-transform duration-600 ease-in-out" />
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
