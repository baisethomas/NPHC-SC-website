'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { normalizeRoles } from '@/lib/roles';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RegisterForm } from './register-form';

type AuthMode = 'sign-in' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdTokenResult();
      const roles = normalizeRoles(token.claims.roles);
      const isStaff = roles.some((role) => role !== 'visitor' && role !== 'member');
      const isMember = roles.includes('member') || isStaff;

      if (isStaff) {
        toast({ title: 'Login Successful', description: 'Redirecting to the admin panel...' });
        router.push('/admin');
      } else if (isMember) {
        toast({ title: 'Login Successful', description: 'Redirecting to the member portal...' });
        router.push('/members');
      } else {
        toast({
          title: 'Login Successful',
          description: 'Your membership access is awaiting approval.',
        });
        router.push('/');
      }
    } catch (error: unknown) {
        const authError = error as AuthError;
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: authError.message,
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side panel with image */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/photos%2F486065740_4131253287097506_5154761858775003667_n.jpg?alt=media&token=98ce7896-a868-4359-80d6-5177068e11df"
            alt="NPHC Solano County Community"
            fill
            className="object-cover object-center"
            priority
            sizes="50vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/60 z-10" />
        
        <div className="relative z-20 max-w-lg text-center">
          <h1 className="text-4xl lg:text-5xl font-headline font-bold mb-4 tracking-tight">NPHC of Solano County</h1>
          <p className="text-lg text-white/90">
            Fostering brotherhood and sisterhood, scholarship, and service within the Solano County community.
          </p>
        </div>
        
        {/* Subtle accent line at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 z-20" />
      </div>

      {/* Right side panel with form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen lg:min-h-0 relative">
        <div className="absolute top-8 left-8 lg:left-8">
          <Button variant="ghost" asChild className="hidden lg:flex items-center text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="flex lg:hidden items-center text-muted-foreground hover:text-foreground absolute top-0 left-0">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>

        <div className="mx-auto w-full max-w-sm mt-12 lg:mt-0">
          <Card className="border-0 shadow-none bg-transparent lg:shadow-xl lg:border lg:bg-white lg:rounded-2xl lg:p-2">
            <CardHeader className="space-y-4 lg:mb-2 items-center text-center pb-6">
              <div className="lg:hidden mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2 mt-4" />
              <div className="space-y-2">
                <CardTitle className="text-3xl lg:text-3xl font-headline font-semibold text-slate-900 tracking-tight">
                  {mode === 'sign-in' ? 'Welcome back' : 'Join our community'}
                </CardTitle>
                <div className="hidden lg:block mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 mt-3 mb-3" />
                <CardDescription className="text-base text-slate-500">
                  {mode === 'sign-in'
                    ? 'Sign in to your account'
                    : 'Request a member account for review'}
                </CardDescription>
              </div>
              <div className="grid w-full grid-cols-2 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Sign in or request an account">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'sign-in'}
                  onClick={() => setMode('sign-in')}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${
                    mode === 'sign-in'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => setMode('register')}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Request Account
                </button>
              </div>
            </CardHeader>

            <CardContent>
              {mode === 'register' ? (
                <RegisterForm onSwitchToSignIn={() => setMode('sign-in')} />
              ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <Input 
                    id="email" 
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
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      Signing In...
                    </>
                  ) : (
                    'Sign in securely'
                  )}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
