import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { B2BCards } from '@/components/shared/B2BCards';
import { FAQSection } from '@/components/shared/FAQSection';
import { categoriesData } from '@/data/categories';
import { companyData } from '@/data/company';
import { Layers, Headphones, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Mehak | Hari Har Industries',
  description:
    'Mehak is the sanitary hardware brand of Hari Har Industries, offering a range of bathroom and sanitary hardware products for everyday bathroom requirements.',
};

export default function AboutPage() {
  const approachItems = [
    {
      title: 'Product Variety',
      description: 'A practical range of sanitary hardware and bathroom fittings.',
      icon: Layers,
    },
    {
      title: 'Business Support',
      description: 'Enquiry support for retailers, dealers, distributors and bulk buyers.',
      icon: Headphones,
    },
    {
      title: 'Practical Solutions',
      description: 'Products intended for everyday bathroom and sanitary hardware requirements.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* SECTION 1 — HERO */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700">
            <div className="relative w-6 h-6 rounded-md bg-black overflow-hidden flex items-center justify-center shrink-0">
              <Image
                src="/images/mehak-logo.png"
                alt="Mehak Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {companyData.name} — Brand: {companyData.brand}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            About Mehak
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Mehak is the sanitary hardware brand of Hari Har Industries, offering a range of bathroom and sanitary hardware products for everyday bathroom requirements.
          </p>
        </div>
      </section>

      {/* SECTION 2 — OUR PRODUCT RANGE */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Catalogue Overview"
            title="Products We Offer"
            description="Our current sanitary hardware product range includes:"
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesData.map((category) => (
              <Card
                key={category.id}
                className="p-6 flex flex-col justify-between bg-slate-50/70 border border-slate-200/80 hover:border-slate-300"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-slate-200/80 text-slate-800 text-[11px] font-semibold mb-3">
                    Category
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{category.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {category.shortDescription}
                  </p>
                </div>
                <Link
                  href={`/products?category=${category.id}`}
                  className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-slate-700 gap-1.5 pt-3 border-t border-slate-200/80"
                >
                  <span>Explore Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — OUR APPROACH */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Operating Values"
            title="Our Approach"
            description="Built around product variety, business support, and practical bathroom hardware solutions."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {approachItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="p-8 text-center flex flex-col items-center bg-white">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 shadow-xs">
                    <Icon className="w-7 h-7 text-slate-100" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — LOOKING FOR SANITARY HARDWARE SUPPLY? (B2B CARDS) */}
      <B2BCards />

      {/* SECTION 5 — FAQ SECTION */}
      <FAQSection />
    </div>
  );
}
