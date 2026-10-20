'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/members", label: "Home" },
  { href: "/members/directory", label: "Directory" },
  { href: "/members/meeting-notes", label: "Meeting notes" },
  { href: "/members/documents", label: "Documents" },
  { href: "/members/messages", label: "Messages" },
  { href: "/members/requests", label: "Requests" },
];

/** Compact text navigation for the member portal. */
export function MembersNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href) && (link.href !== "/members" || pathname === "/members");
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex items-center rounded-md px-3 py-2 text-sm transition-colors",
              isActive ? "bg-ink font-semibold text-ivory" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-gold" aria-hidden />}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
