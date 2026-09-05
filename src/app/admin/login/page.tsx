'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams?.get('reset') === 'success';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Successfully authenticated -> redirect to dashboard
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Login submit error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-8 space-y-6 relative z-10">
      {/* Header Branding */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative h-16 w-16 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-700 shadow-lg">
          <Image
            src="/images/mehak-logo.png"
            alt="Mehak Logo"
            width={56}
            height={56}
            className="object-contain p-1"
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
            Hari Har Industries — Mehak
          </p>
        </div>
      </div>

      {/* Success Notification after Reset */}
      {resetSuccess && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-700/90 text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Password reset successfully! Please sign in with your new password.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800/80 text-red-200 text-xs rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Administrator Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="admin@hariharindustries.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
            />
          </div>
        </div>

        <Button
          variant="metallic"
          size="lg"
          type="submit"
          disabled={loading}
          fullWidth
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
        </Button>
      </form>

      {/* Security Footer Notice */}
      <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-700/60">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Restricted Admin Portal — Authorized Access Only</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-slate-400 text-xs">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
