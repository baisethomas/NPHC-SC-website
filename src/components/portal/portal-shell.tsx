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
import {
  LayoutDashboard,
  Calendar,
  Newspaper,
  Users,
  Building2,
  FileText,
  GraduationCap,
  Inbox,
  Mail,
  Settings,
  MessageSquare,
  Send,
  Menu,
  LogOut,
  Globe,
  ShieldCheck,
  UserCircle,
  PenSquare,
  type LucideIcon,
} from "lucide-react";

const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FNPHC-Official-Logo-sq.png?alt=media&token=d7a5c6b7-4460-492b-871f-13bd90b64da7";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const ADMIN_NAV: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "People",
    items: [
      { href: "/admin/members", label: "Members", icon: Users },
      { href: "/admin/board", label: "Board Members", icon: ShieldCheck },
      { href: "/admin/organizations", label: "Organizations", icon: Building2 },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/admin/inbox", label: "Inbox", icon: Inbox },
      { href: "/admin/announcements", label: "Announcements", icon: Newspaper },
      { href: "/admin/mailing-list", label: "Mailing List", icon: Mail },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/events", label: "Events", icon: Calendar },
      { href: "/admin/programs", label: "Programs", icon: GraduationCap },
      { href: "/admin/documents", label: "Documents", icon: FileText },
      { href: "/admin/content", label: "Page Content", icon: PenSquare },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Site Settings", icon: Settings }],
  },
];

const MEMBERS_NAV: NavGroup[] = [
  {
    items: [{ href: "/members", label: "Home", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Community",
    items: [
      { href: "/members/directory", label: "Directory", icon: Users },
      { href: "/members/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/members/meeting-notes", label: "Meeting Notes", icon: FileText },
      { href: "/members/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Council",
    items: [{ href: "/members/requests", label: "Requests", icon: Send }],
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
    <nav className="flex flex-col gap-5">
      {groups.map((group, i) => (
        <div key={group.label ?? i}>
          {group.label && (
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isItemActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-yellow-400" : "text-slate-400")} />
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
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <Image
            src={LOGO_URL}
            alt="NPHC Solano County"
            width={36}
            height={36}
            className="h-9 w-9 rounded-md object-contain"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">NPHC Solano</p>
            <p className="text-xs text-slate-500">
              {variant === "admin" ? "Admin Panel" : "Member Portal"}
            </p>
          </div>
        </Link>
        <div className="mt-4 h-0.5 w-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <NavLinks groups={groups} pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-slate-200 px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Globe className="h-4 w-4 text-slate-400" />
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent variant={variant} pathname={pathname} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex h-14 items-center gap-3 px-4 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent
                  variant={variant}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="flex min-w-0 items-baseline gap-2">
              <span className="hidden text-sm text-slate-400 sm:inline">
                {variant === "admin" ? "Admin" : "Members"}
              </span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <h1 className="truncate text-sm font-semibold text-slate-900">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {variant === "admin" && membershipApproved && (
                <Button asChild variant="ghost" size="sm" className="hidden text-slate-600 md:inline-flex">
                  <Link href="/members">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Member Portal
                  </Link>
                </Button>
              )}
              {variant === "members" && canAccessAdmin && (
                <Button asChild variant="ghost" size="sm" className="hidden text-slate-600 md:inline-flex">
                  <Link href="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition-opacity hover:opacity-85"
                    aria-label="Account menu"
                  >
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                    <p className="truncate text-xs font-normal text-slate-500">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {variant === "admin" && membershipApproved && (
                    <DropdownMenuItem asChild>
                      <Link href="/members">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Member Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {variant === "members" && canAccessAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Panel
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
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
