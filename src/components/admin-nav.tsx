'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Newspaper, Users, Building2, FileText, GraduationCap } from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/announcements", label: "Announcements", icon: Newspaper },
  { href: "/admin/board", label: "Board Members", icon: Users },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/documents", label: "Documents", icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href) && (link.href !== "/admin" || pathname === "/admin");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-violet-50 text-violet-700"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Icon className="mr-3 h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
