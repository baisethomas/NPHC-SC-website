'use client';

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
