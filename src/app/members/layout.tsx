'use client';

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PortalShell } from "@/components/portal/portal-shell";

export default function MembersLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'member']} requireApprovedMembership>
      <PortalShell variant="members">{children}</PortalShell>
    </ProtectedRoute>
  );
}
