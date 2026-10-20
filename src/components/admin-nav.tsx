'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Newspaper,
  Users,
  Building2,
  FileText,
  GraduationCap,
  Inbox,
  ClipboardList,
  Mail,
  Settings,
  ShieldCheck,
  PenSquare,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
export type AdminNavGroup = { label?: string; items: AdminNavItem[] };

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    label: "Content",
    items: [
      { href: "/admin/events", label: "Events", icon: Calendar },
      { href: "/admin/announcements", label: "Announcements", icon: Newspaper },
      { href: "/admin/programs", label: "Programs", icon: GraduationCap },
      { href: "/admin/board", label: "Board members", icon: ShieldCheck },
      { href: "/admin/organizations", label: "Organizations", icon: Building2 },
      { href: "/admin/content", label: "Page content", icon: PenSquare },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/members", label: "Members", icon: Users },
      { href: "/admin/requests", label: "Requests", icon: ClipboardList },
      { href: "/admin/mailing-list", label: "Mailing list", icon: Mail },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/documents", label: "Documents", icon: FileText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function isAdminItemActive(pathname: string, item: AdminNavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function adminPageTitle(pathname: string) {
  const match = ADMIN_NAV_GROUPS.flatMap((g) => g.items)
    .filter((item) => isAdminItemActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Dashboard";
}

/**
 * Grouped admin navigation on an ink ground. The active item is marked with a
 * gold rule on its left edge rather than a filled pill.
 */
export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {ADMIN_NAV_GROUPS.map((group, i) => (
        <div key={group.label ?? i}>
          {group.label && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/40">{group.label}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isAdminItemActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-ivory/[0.06] text-ivory" : "text-ivory/65 hover:bg-ivory/[0.04] hover:text-ivory"
                    )}
                  >
                    <span
                      className={cn("absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-gold transition-opacity", active ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-gold" : "text-ivory/40")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
