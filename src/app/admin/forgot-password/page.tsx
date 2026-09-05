'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process password reset request.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'If an administrator account exists with that email, a password reset link has been sent.');
    } catch (err) {
      console.error('Forgot password submit error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-8 space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative h-14 w-14 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-700 shadow-lg">
            <KeyRound className="w-7 h-7 text-slate-200" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Forgot Password</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Enter your admin email to receive a secure password reset link
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-800/80 text-red-200 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Success State */}
        {successMessage ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-950/90 border border-emerald-700/90 text-emerald-100 text-xs rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="leading-relaxed text-emerald-200/90">
                {successMessage}
              </p>
              <p className="text-[11px] text-emerald-300/70 pt-1">
                Please check your inbox. The reset link expires in 30 minutes.
              </p>
            </div>

            <Button
              variant="outline"
              size="lg"
              href="/admin/login"
              fullWidth
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Admin Login
            </Button>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registered Administrator Email
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

            <Button
              variant="metallic"
              size="lg"
              type="submit"
              disabled={loading}
              fullWidth
              icon={<Send className="w-4 h-4" />}
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </Button>

            <div className="pt-2 text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
