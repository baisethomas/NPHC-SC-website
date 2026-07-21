'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface RegisterFormProps {
  onSwitchToSignIn: () => void;
}

function friendlyAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/invalid-email':
        return 'That email address does not look valid. Please double-check it.';
      case 'auth/weak-password':
        return 'That password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'Something went wrong creating your account. Please try again.';
    }
  }
  return 'Something went wrong creating your account. Please try again.';
}

export function RegisterForm({ onSwitchToSignIn }: RegisterFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter your full name (at least 2 characters).',
      });
      return;
    }
    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Your password must be at least 8 characters long.',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please re-enter your password so both fields match.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const trimmedOrg = organizationName.trim();
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          displayName: trimmedName,
          ...(trimmedOrg ? { organizationName: trimmedOrg } : {}),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Registration failed');
      }

      setSubmitted(true);
      toast({
        title: 'Request submitted',
        description: 'An administrator will review your membership request.',
      });
    } catch (error: unknown) {
      const description =
        error instanceof FirebaseError
          ? friendlyAuthError(error)
          : error instanceof Error && error.message !== 'Registration failed'
            ? error.message
            : 'Something went wrong submitting your request. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden="true" />
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">Request submitted</p>
          <p className="text-sm text-slate-500">
            Thanks, {displayName.trim()}. An administrator will review your membership request.
            You&apos;ll gain access to the member portal once your account is approved.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={onSwitchToSignIn}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-slate-700 font-medium">Full Name</Label>
        <Input
          id="register-name"
          name="displayName"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
          required
          minLength={2}
          maxLength={200}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full text-base lg:text-sm py-5 lg:py-2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-slate-700 font-medium">Email Address</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-base lg:text-sm py-5 lg:py-2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-slate-700 font-medium">Password</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-base lg:text-sm py-5 lg:py-2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-confirm-password" className="text-slate-700 font-medium">Confirm Password</Label>
        <Input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full text-base lg:text-sm py-5 lg:py-2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-organization" className="text-slate-700 font-medium">
          Organization / Chapter <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="register-organization"
          name="organizationName"
          type="text"
          placeholder="e.g. Alpha Kappa Alpha Sorority, Inc."
          autoComplete="organization"
          maxLength={200}
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          className="w-full text-base lg:text-sm py-5 lg:py-2"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12 lg:h-10 text-base lg:text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Request...
          </>
        ) : (
          'Request an account'
        )}
      </Button>
    </form>
  );
}
