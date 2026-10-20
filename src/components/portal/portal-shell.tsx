'use client';

import { ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
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
import { Menu, LogOut, Globe, ShieldCheck, UserCircle } from "lucide-react";

const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FNPHC-Official-Logo-sq.png?alt=media&token=d7a5c6b7-4460-492b-871f-13bd90b64da7";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const ADMIN_NAV: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    label: "People",
    items: [
      { href: "/admin/members", label: "Members" },
      { href: "/admin/board", label: "Board members" },
      { href: "/admin/organizations", label: "Organizations" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/admin/inbox", label: "Inbox" },
      { href: "/admin/announcements", label: "Announcements" },
      { href: "/admin/mailing-list", label: "Mailing list" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/events", label: "Events" },
      { href: "/admin/programs", label: "Programs" },
      { href: "/admin/documents", label: "Documents" },
      { href: "/admin/content", label: "Page content" },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Site settings" }],
  },
];

const MEMBERS_NAV: NavGroup[] = [
  {
    items: [{ href: "/members", label: "Home", exact: true }],
  },
  {
    label: "Community",
    items: [
      { href: "/members/directory", label: "Directory" },
      { href: "/members/messages", label: "Messages" },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/members/meeting-notes", label: "Meeting notes" },
      { href: "/members/documents", label: "Documents" },
    ],
  },
  {
    label: "Council",
    items: [{ href: "/members/requests", label: "Requests" }],
  },
  {
    label: "Account",
    items: [{ href: "/members/profile", label: "My profile" }],
  },
];

function isItemActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavLinks({
  groups,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-6">
      {groups.map((group, i) => (
        <div key={group.label ?? i}>
          {group.label && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/40">{group.label}</p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                    active ? "bg-ivory/10 font-semibold text-ivory" : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
                  )}
                >
                  {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-gold" aria-hidden />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({
  variant,
  pathname,
  onNavigate,
}: {
  variant: "admin" | "members";
  pathname: string;
  onNavigate?: () => void;
}) {
  const groups = variant === "admin" ? ADMIN_NAV : MEMBERS_NAV;
  return (
    <div className="flex h-full flex-col bg-ink text-ivory">
      <div className="px-5 pb-5 pt-6">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <Image src={LOGO_URL} alt="NPHC Solano County" width={36} height={36} className="h-9 w-9 rounded-md bg-ivory object-contain p-0.5" />
          <div className="min-w-0">
            <p className="truncate font-headline text-base font-bold leading-tight">NPHC Solano</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
              {variant === "admin" ? "Admin" : "Member portal"}
            </p>
          </div>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <NavLinks groups={groups} pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-ivory/10 px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ivory/70 transition-colors hover:bg-ivory/5 hover:text-ivory"
        >
          <Globe className="h-4 w-4 text-ivory/50" />
          View public site
        </Link>
      </div>
    </div>
  );
}

function pageTitleFor(pathname: string, variant: "admin" | "members") {
  const groups = variant === "admin" ? ADMIN_NAV : MEMBERS_NAV;
  const items = groups.flatMap((g) => g.items);
  // Longest matching href wins so /admin/members beats /admin
  const match = items
    .filter((item) => isItemActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? (variant === "admin" ? "Dashboard" : "Home");
}

export function PortalShell({
  variant,
  children,
}: {
  variant: "admin" | "members";
  children: ReactNode;
}) {
  const { user, roles, membershipApproved } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const canAccessAdmin = roles.some((role) => role !== "visitor" && role !== "member");
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Member";
  const initial = (user?.displayName || user?.email || "M").charAt(0).toUpperCase();
  const title = pageTitleFor(pathname, variant);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent variant={variant} pathname={pathname} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Top bar */}
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
                <SidebarContent variant={variant} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex min-w-0 items-baseline gap-2">
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                {variant === "admin" ? "Admin" : "Members"}
              </span>
              <span className="hidden text-border sm:inline">/</span>
              <span className="truncate text-sm font-semibold text-foreground">{title}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {variant === "admin" && membershipApproved && (
                <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground md:inline-flex">
                  <Link href="/members">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Member portal
                  </Link>
                </Button>
              )}
              {variant === "members" && canAccessAdmin && (
                <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground md:inline-flex">
                  <Link href="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-headline text-sm font-bold text-gold ring-offset-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                    aria-label="Account menu"
                  >
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {variant === "admin" && membershipApproved && (
                    <DropdownMenuItem asChild>
                      <Link href="/members">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Member portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {variant === "members" && canAccessAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin panel
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
          <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
