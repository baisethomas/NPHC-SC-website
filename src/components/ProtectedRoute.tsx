'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import { useAuth, Role } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
  requireApprovedMembership?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireApprovedMembership = false,
}: ProtectedRouteProps) {
  const { role, loading, membershipApproved } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (role === 'guest') {
        router.push('/login');
      }
    }
  }, [role, loading, router]);

  // Loading state
  if (loading || role === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Redirecting state (guest logic processed in useEffect)
  if (role === 'guest') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Unauthorized state
  if (
    !allowedRoles.includes(role) ||
    (requireApprovedMembership && !membershipApproved)
  ) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 max-w-md mb-8">
          You do not have the necessary permissions to view this content. If you believe this is an error, please contact an administrator.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/">Back to Homepage</Link>
        </Button>
      </div>
    );
  }

  // Authorized state
  return <>{children}</>;
}
