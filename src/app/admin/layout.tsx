'use client';

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PortalShell } from "@/components/portal/portal-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <PortalShell variant="admin">{children}</PortalShell>
    </ProtectedRoute>
  );
}
