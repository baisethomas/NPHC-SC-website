'use client';

import { ReactNode } from "react";
import { MembersNav } from "@/components/members-nav";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function MembersLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/members') return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) {
      const pageName = segments[1].replace(/-/g, ' ');
      return pageName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return 'Dashboard';
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'member']}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-violet-600 rounded-md flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="ml-3 font-semibold text-gray-900">Members Portal</span>
            </div>
            
            <div className="flex-1">
              <MembersNav />
            </div>
            
            {/* User Profile Section */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-violet-700">
                      {user?.email?.charAt(0).toUpperCase() || 'M'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'Member'}
                  </p>
                  <p className="text-xs font-medium text-gray-500">Member</p>
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
    </ProtectedRoute>
  );
}
