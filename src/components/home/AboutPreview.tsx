'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Button } from '../ui/Button';
import { companyData } from '@/data/company';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

export const AboutPreview: React.FC = () => {
  const settings = useBusinessSettings();

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image Showcase Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 h-80 sm:h-96 w-full">
              <Image
                src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=1000"
                alt={`${settings.name} ${settings.brand} Sanitary Fittings`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-slate-900/10" />
            </div>
          </div>

          {/* About Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <SectionHeading
              badge="About Our Enterprise"
              title={`${settings.name} — ${settings.brand}`}
              align="left"
              className="mb-4"
            />

            <p className="text-base text-slate-700 leading-relaxed">
              {settings.description}
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Serving Key Channels Across India:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                {companyData.targetCustomers.map((customer, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-800 shrink-0" />
                    <span>{customer}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                href="/about"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
