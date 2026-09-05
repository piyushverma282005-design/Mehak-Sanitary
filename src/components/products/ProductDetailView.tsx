'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Button } from '../ui/Button';
import { ProductImagePlaceholder } from '../ui/ProductImagePlaceholder';
import { EnquiryModal } from '../ui/EnquiryModal';
import { companyData } from '@/data/company';
import { ArrowLeft, PhoneCall, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ProductDetailViewProps {
  product: Product;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  // Formatted WhatsApp link with pre-filled product inquiry message
  const whatsappProductUrl = `${companyData.contact.whatsappUrl}?text=${encodeURIComponent(
    `Hello, I am interested in ${product.name}. Please share the details.`
  )}`;

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 gap-2 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Sanitary Catalogue</span>
          </Link>
        </div>

        {/* Product Details Layout */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left: Product Image / Gallery Area */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {product.image ? (
                  <div className="relative h-80 sm:h-[420px] w-full">
                    <Image
                      src={product.image}
                      alt={`Mehak ${product.name}`}
                      fill
                      priority
                      unoptimized={product.image.startsWith('data:')}
                      className="object-cover object-center"
                    />
                  </div>
                ) : (
                  <ProductImagePlaceholder
                    productName={product.name}
                    categoryName={product.categoryName}
                    aspectRatio="square"
                    className="h-80 sm:h-[420px]"
                  />
                )}
              </div>
            </div>

            {/* Right: Product Details & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category & Material Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                  {product.categoryName}
                </span>
                {product.material && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white">
                    {product.material}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Enquiry Pricing Notice (No Fake Prices) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pricing & Order Information
                </div>
                <div className="text-lg font-bold text-slate-900">
                  Contact us for product details
                </div>
                <p className="text-xs text-slate-600">
                  Competitive trade & dealer pricing available upon enquiry submission.
                </p>
              </div>

              {/* Full Product Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Product Overview
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications List if available */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Specifications & Metadata
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between"
                      >
                        <span className="text-slate-500 font-medium">{spec.label}</span>
                        <span className="text-slate-900 font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="metallic"
                  size="lg"
                  onClick={() => setIsEnquiryOpen(true)}
                  icon={<PhoneCall className="w-5 h-5" />}
                  className="flex-1"
                >
                  Enquire About This Product
                </Button>

                <Button
                  variant="whatsapp"
                  size="lg"
                  href={whatsappProductUrl}
                  icon={<MessageSquare className="w-5 h-5" />}
                  className="flex-1"
                >
                  WhatsApp Us
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0" />
                  <span>Hari Har Industries Engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-800 shrink-0" />
                  <span>Dealer & Bulk Supply Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        productName={product.name}
        defaultCategory={product.category}
      />
    </div>
  );
};
