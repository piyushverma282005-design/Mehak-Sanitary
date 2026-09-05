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
  Settings,
  Shield,
  User,
  ChevronRight,
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

  if (loading || !adminUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {loading ? 'Authenticating Admin Session...' : 'Redirecting to Security Login...'}
        </p>
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
    { name: 'Products Catalogue', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Customer Enquiries', href: '/admin/enquiries', icon: Inbox },
    { name: 'Website Settings', href: '/admin/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname.startsWith('/admin/products/new')) return 'Add New Product';
    if (pathname.startsWith('/admin/products') && pathname.endsWith('/edit')) return 'Edit Product';
    if (pathname.startsWith('/admin/products')) return 'Product Catalogue';
    if (pathname.startsWith('/admin/categories')) return 'Category Management';
    if (pathname.startsWith('/admin/enquiries')) return 'Customer Enquiries';
    if (pathname.startsWith('/admin/settings')) return 'Website & Business Settings';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800/80 shrink-0 shadow-xl">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner shrink-0">
            <Image
              src="/images/mehak-logo.png"
              alt="Mehak Logo"
              width={40}
              height={40}
              className="object-contain p-0.5"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-white text-sm tracking-tight truncate">{companyData.brand} Admin</h2>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {companyData.name}
            </p>
          </div>
        </div>

        {/* Navigation Section Header */}
        <div className="px-5 pt-5 pb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
          Main Menu
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  active
                    ? 'bg-slate-800 text-white border-l-4 border-emerald-400 shadow-xs pl-3'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span className="flex-1">{item.name}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User & Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/50">
          {/* Authenticated Admin Pill */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-200 truncate">{adminUser?.email}</p>
              <p className="text-[9px] text-slate-500 font-medium">System Administrator</p>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                View Customer Site
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-950 text-white p-4 border-b border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-slate-800">
            <Image
              src="/images/mehak-logo.png"
              alt="Mehak Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white block">Mehak Admin</span>
            <span className="text-[9px] text-slate-400 block">{getPageTitle()}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center border border-slate-800">
                <Image src="/images/mehak-logo.png" alt="Logo" width={36} height={36} className="object-contain" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">{companyData.brand} Admin</span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">{adminUser?.email}</span>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                    active ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-300 bg-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
            >
              <span>View Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar Desktop */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Breadcrumb / Page Title */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <h1 className="text-sm font-bold text-slate-900">{getPageTitle()}</h1>
          </div>

          {/* User Status & Quick Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl border border-slate-200 transition-colors"
            >
              <span>View Customer Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">{adminUser?.email}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
