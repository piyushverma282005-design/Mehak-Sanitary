'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { companyData } from '@/data/company';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const isPublicAdminPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  useEffect(() => {
    if (isPublicAdminPage) {
      setLoading(false);
      return;
    }

    // Verify Admin Session via API
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setAdminUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/login');
        setLoading(false);
      });
  }, [pathname, isPublicAdminPage, router]);

  if (isPublicAdminPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-300">Verifying Admin Session...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Customer Enquiries', href: '/admin/enquiries', icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-800 shrink-0">
            <Image
              src="/images/mehak-logo.png"
              alt="Mehak Logo"
              width={40}
              height={40}
              className="object-contain p-0.5"
            />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight">{companyData.brand} Admin</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {companyData.name}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-2xs'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Public Website
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-slate-700">
            <Image
              src="/images/mehak-logo.png"
              alt="Mehak Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-sm">Mehak Admin</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white p-4 space-y-2 border-b border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold ${
                  active ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <Link href="/" target="_blank" className="text-slate-300">
              View Public Website
            </Link>
            <button onClick={handleLogout} className="text-red-400 font-semibold">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Authenticated Admin: <span className="font-bold text-slate-900">{adminUser?.email}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
