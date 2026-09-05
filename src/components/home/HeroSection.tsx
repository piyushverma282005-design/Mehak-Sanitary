'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, PhoneCall, ShieldCheck, Award, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { EnquiryModal } from '../ui/EnquiryModal';
import { companyData } from '@/data/company';

export const HeroSection: React.FC = () => {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle Metallic Background Accent Overlays */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Brand Badge with Official Logo */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-slate-300 shadow-xs">
              <div className="relative w-5 h-5 rounded-md bg-black overflow-hidden flex items-center justify-center shrink-0">
                <Image
                  src="/images/mehak-logo.png"
                  alt="Mehak - Hari Har Industries"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-white">{companyData.name}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span>Brand: {companyData.brand}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Complete Bathroom Solution
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {companyData.brand} by {companyData.name} delivers engineered sanitary hardware, PTMT polymer fittings, heavy brass valves, and stainless steel accessories designed for modern durability and effortless water flow.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                variant="secondary"
                size="lg"
                href="/products"
                icon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Explore Products
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsEnquiryOpen(true)}
                icon={<PhoneCall className="w-5 h-5" />}
                className="w-full sm:w-auto text-slate-900"
              >
                Get a Business Enquiry
              </Button>
            </div>

            {/* Core Value Highlights (No Fake Stats) */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start">
                <ShieldCheck className="w-5 h-5 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-white">Quality Checked</span>
                <span className="text-[11px] text-slate-400">Strict Tolerances</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <Layers className="w-5 h-5 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-white">Tri-Material</span>
                <span className="text-[11px] text-slate-400">Brass, SS & PTMT</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <Award className="w-5 h-5 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-white">Bulk Supply</span>
                <span className="text-[11px] text-slate-400">Dealers & Projects</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Area (Replaceable Product Photography Showcase Grid) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-800/60 p-2 shadow-2xl">
              <div className="relative h-[340px] sm:h-[420px] w-full rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200"
                  alt="Mehak Premium Sanitary Fittings & Bathroom Hardware Showcase"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-xs">
                  <div className="font-semibold text-white">Replaceable Showcase Photography Area</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Structure ready for actual Mehak product catalog photos.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
    </section>
  );
};
