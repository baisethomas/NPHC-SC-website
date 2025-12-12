'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, MessageSquare, Send, Users } from "lucide-react";

const navLinks = [
  { href: "/members", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members/meeting-notes", label: "Meeting Notes", icon: FileText },
  { href: "/members/documents", label: "Documents", icon: FileText },
  { href: "/members/messages", label: "Messages", icon: MessageSquare },
  { href: "/members/requests", label: "Requests", icon: Send },
];

export function MembersNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href) && (link.href !== "/members" || pathname === "/members");
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

