'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Mail, Lock, Phone, User, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Signup() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();

  const [role, setRole] = useState<'business' | 'creator'>('business');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(email, password, role, name, phone);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      // Redirect to correct setup profiles
      if (role === 'business') {
        router.push('/business/profile');
      } else {
        router.push('/creator/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(role);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      if (role === 'business') {
        router.push('/business/profile');
      } else {
        router.push('/creator/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="text-center mb-6">
          <span className="gradient-primary inline-flex h-10 w-10 items-center justify-center rounded-xl text-white font-mono text-lg font-bold shadow-md mb-3">
            C
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Create your account
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Join the local social media marketplace
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive">
            {error}
          </div>
        )}

        {/* Account Type Selector (Used for both standard and Google signup) */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
            Choose Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('business')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                role === 'business'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
              }`}
            >
              <Briefcase className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold">Business Owner</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Hire local creators</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('creator')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                role === 'creator'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
              }`}
            >
              <UserCheck className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold">Content Creator</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Earn from collabs</span>
            </button>
          </div>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80"></div>
          </div>
          <span className="relative bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground">Sign Up options</span>
        </div>

        {/* Google sign up button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full h-11 rounded-xl border border-border bg-background hover:bg-secondary/40 text-sm font-bold text-foreground transition-all flex items-center justify-center gap-2 shadow-sm mb-4"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Sign Up with Google
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80"></div>
          </div>
          <span className="relative bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground">Or with Email</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {role === 'business' ? 'Business Name' : 'Full Name'} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder={role === 'business' ? 'e.g., Bandra Bakery' : 'e.g., Rohan Mehra'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="rohan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                required
                placeholder="e.g., +91 99887 76655"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl gradient-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-90 transition-opacity mt-2 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
