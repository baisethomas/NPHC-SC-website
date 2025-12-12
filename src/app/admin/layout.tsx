'use client';

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) {
      return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    }
    return 'Dashboard';
  };

  // User is logged in and is an admin
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-violet-600 rounded-md flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="ml-3 font-semibold text-gray-900">Admin Panel</span>
          </div>
          
          <div className="flex-1">
            <AdminNav />
          </div>
          
          {/* User Profile Section */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-violet-700">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-xs font-medium text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
