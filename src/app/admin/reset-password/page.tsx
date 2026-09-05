'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-8 text-center space-y-6 relative z-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Missing Reset Token</h2>
          <p className="text-xs text-slate-400">
            This password reset link is invalid or incomplete. Please request a new link from the forgot password page.
          </p>
        </div>
        <Button variant="metallic" size="md" href="/admin/forgot-password" fullWidth>
          Request New Password Reset Link
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please enter matching passwords.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
        setLoading(false);
        return;
      }

      // Successful password reset -> Redirect to login page with success notification query parameter
      router.push('/admin/login?reset=success');
    } catch (err) {
      console.error('Reset password submit error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-8 space-y-6 relative z-10">
      {/* Header Branding */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative h-14 w-14 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-700 shadow-lg">
          <KeyRound className="w-7 h-7 text-slate-200" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Choose a strong new password for your admin account
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 bg-red-950/80 border border-red-800/80 text-red-200 text-xs rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            New Password (Min 8 characters)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Updating Password...' : 'Reset & Save Password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-slate-400 text-xs">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
