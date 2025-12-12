'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful', description: 'Redirecting to admin panel...' });
      router.push('/admin');
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
    <div className="bg-gradient-to-br from-blue-200 via-violet-200 to-indigo-200 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400 opacity-30 blur-3xl"></div>
        <div className="absolute top-40 right-0 w-72 h-72 rounded-full bg-violet-400 opacity-40 blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-indigo-400 opacity-30 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-blue-900 mb-1">Welcome back</h2>
            <p className="text-blue-600 text-sm">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-blue-800 text-sm font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white/80 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="you@email.com"
              />
            </div>
            
            <div>
              <label className="block text-blue-800 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white/80 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-lg shadow-md hover:from-blue-600 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
