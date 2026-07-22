'use client';

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Admin panel and member portal render their own full-screen shell,
// so the public site chrome is suppressed on those routes. Header and
// footer arrive as slots so they stay server components (the footer
// reads site settings through the Firebase Admin SDK).
const PORTAL_PREFIXES = ["/admin", "/members"];

export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isPortal = PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  );
}
