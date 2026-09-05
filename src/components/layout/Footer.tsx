'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, MessageSquare, ArrowUpRight } from 'lucide-react';
import { categoriesData } from '@/data/categories';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

export const Footer: React.FC = () => {
  const settings = useBusinessSettings();
  const phoneNumbers = [settings.phonePrimary, settings.phoneSecondary, settings.phoneTertiary].filter(Boolean) as string[];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Column 1 & 2: Official Logo & Brand Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
              <div className="relative h-14 w-14 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-800 shadow-md shrink-0 group-hover:border-slate-700 transition-colors">
                <Image
                  src="/images/mehak-logo.png"
                  alt={`Mehak - ${settings.name}`}
                  width={56}
                  height={56}
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight block group-hover:text-slate-200 transition-colors">
                  {settings.brand}
                </span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest block">
                  by {settings.name}
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md line-clamp-3">
              {settings.description}
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {settings.tagline}
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Hari Har Industries
                </Link>
              </li>
              <li>
                <Link href="/dealer-enquiry" className="hover:text-white transition-colors">
                  Dealer & Bulk Enquiry
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Product Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categoriesData.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Official Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact Details
            </h4>
            <ul className="space-y-3 text-sm">
              {/* Clickable Phone Numbers */}
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                <div className="flex flex-col space-y-1">
                  {phoneNumbers.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone}`}
                      className="hover:text-white transition-colors font-mono text-xs"
                    >
                      +91 {phone}
                    </a>
                  ))}
                </div>
              </li>

              {/* Clickable WhatsApp */}
              {settings.whatsapp && (
                <li className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`https://wa.me/91${settings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-300 text-emerald-400 font-semibold transition-colors font-mono text-xs"
                  >
                    WhatsApp: +91 {settings.whatsapp}
                  </a>
                </li>
              )}

              {/* Clickable Email */}
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors text-xs break-all"
                  >
                    {settings.email}
                  </a>
                </li>
              )}

              {/* Address & Maps */}
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  {settings.googleMapsUrl ? (
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 text-xs hover:text-white transition-colors group flex flex-col gap-1"
                    >
                      <span>
                        {settings.address}, {settings.city}, {settings.state} - {settings.pincode}, {settings.country}
                      </span>
                      <span className="text-xs text-blue-400 group-hover:underline flex items-center gap-1">
                        <span>Open in Google Maps</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs">
                      {settings.address}, {settings.city}, {settings.state} - {settings.pincode}, {settings.country}
                    </span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {settings.name} — Brand: {settings.brand}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                <span>Instagram</span> <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                <span>Facebook</span> <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                <span>YouTube</span> <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
