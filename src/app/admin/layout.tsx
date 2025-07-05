'use client';

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, LoaderCircle } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        // Redirect non-admins home
        router.push('/');
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user) {
    // This state covers loading, or a logged-out user before redirect.
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // This state covers a logged-in user who is not an admin.
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <p className="text-muted-foreground">Redirecting to the homepage...</p>
      </div>
    );
  }

  // User is logged in and is an admin
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-6 w-6" />
              <span className="">Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1">
            <AdminNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
