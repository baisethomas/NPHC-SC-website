'use client';

import { ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, Globe, UserCircle } from "lucide-react";
import { AdminNav, adminPageTitle } from "@/components/admin-nav";

const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FNPHC-Official-Logo-sq.png?alt=media&token=d7a5c6b7-4460-492b-871f-13bd90b64da7";

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-ink text-ivory">
      <div className="px-5 pb-5 pt-6">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <Image src={LOGO_URL} alt="" width={36} height={36} className="h-9 w-9 rounded-md bg-ivory object-contain p-0.5" />
          <span className="min-w-0">
            <span className="block truncate font-headline text-base font-bold leading-tight">NPHC Solano County</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Admin</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <AdminNav onNavigate={onNavigate} />
      </div>
      <div className="border-t border-ivory/10 px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ivory/65 transition-colors hover:bg-ivory/[0.04] hover:text-ivory"
        >
          <Globe className="h-4 w-4 text-ivory/40" />
          View public site
        </Link>
      </div>
    </div>
  );
}

/**
 * Admin chrome: ink sidebar with grouped navigation on desktop, a sheet on
 * mobile, and a slim top bar with the page title and account menu.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { user, membershipApproved } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = (user?.displayName || user?.email || "A").charAt(0).toUpperCase();
  const title = adminPageTitle(pathname);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-0 bg-ink p-0 text-ivory">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <p className="flex min-w-0 items-baseline gap-2 text-sm">
              <span className="hidden text-muted-foreground sm:inline">Admin</span>
              <span className="hidden text-border sm:inline">/</span>
              <span className="truncate font-semibold">{title}</span>
            </p>

            <div className="ml-auto flex items-center gap-2">
              {membershipApproved && (
                <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground md:inline-flex">
                  <Link href="/members">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Member portal
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-headline text-sm font-bold text-gold transition-opacity hover:opacity-85"
                    aria-label="Account menu"
                  >
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {membershipApproved && (
                    <DropdownMenuItem asChild>
                      <Link href="/members">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Member portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Globe className="mr-2 h-4 w-4" />
                      View public site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
