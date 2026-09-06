'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, PhoneCall } from 'lucide-react';
import { Button } from '../ui/Button';
import { EnquiryModal } from '../ui/EnquiryModal';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

export const Navbar: React.FC = () => {
  const settings = useBusinessSettings();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About Us', href: '/about' },
    { name: 'Dealer Enquiry', href: '/dealer-enquiry' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Official Mehak Logo & Brand Slogan */}
            <Link href="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
              <div className="relative h-12 w-12 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-800 shadow-xs group-hover:border-slate-700 transition-colors shrink-0">
                <Image
                  src="/images/mehak-logo.png"
                  alt={`Mehak - ${settings.name}`}
                  width={48}
                  height={48}
                  priority
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                    {settings.brand}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden xs:inline">
                    by {settings.name}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 tracking-wide">
                  {settings.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'text-slate-900 bg-slate-100 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="metallic"
                size="md"
                onClick={() => setIsEnquiryOpen(true)}
                icon={<PhoneCall className="w-4 h-4" />}
              >
                Enquire Now
              </Button>
            </div>

            {/* Mobile Hamburger Toggle & Quick CTA */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="metallic"
                size="sm"
                onClick={() => setIsEnquiryOpen(true)}
                className="text-xs px-2.5 py-1.5"
              >
                Enquire
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-base font-medium rounded-lg transition-colors ${
                    active
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100">
              <Button
                variant="metallic"
                size="md"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsEnquiryOpen(true);
                }}
                icon={<PhoneCall className="w-4 h-4" />}
              >
                Enquire Now
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Quick Enquiry Modal */}
      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
    </>
  );
};
