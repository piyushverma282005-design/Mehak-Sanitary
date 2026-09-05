'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DealerEnquiryForm } from '@/components/forms/DealerEnquiryForm';
import { FAQSection } from '@/components/shared/FAQSection';
import { EnquiryModal } from '@/components/ui/EnquiryModal';
import { companyData } from '@/data/company';
import {
  HelpCircle,
  Building2,
  Truck,
  Boxes,
  MessageSquareText,
  Send,
  MessageSquare,
  Phone,
} from 'lucide-react';

export default function DealerEnquiryPage() {
  const [modalCategory, setModalCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenHelpCard = (category: string) => {
    setModalCategory(category);
    setIsModalOpen(true);
  };

  const helpTypes = [
    {
      title: 'Product Enquiry',
      description: 'Inquire about specific fittings, material options, or catalog specs.',
      icon: HelpCircle,
    },
    {
      title: 'Dealer Enquiry',
      description: 'Explore business opportunities for stocking Mehak sanitary hardware.',
      icon: Building2,
    },
    {
      title: 'Distributor Enquiry',
      description: 'Connect regarding regional distribution channels and stock supply.',
      icon: Truck,
    },
    {
      title: 'Bulk Requirement',
      description: 'Submit requirements for commercial building projects or bulk hardware.',
      icon: Boxes,
    },
    {
      title: 'General Enquiry',
      description: 'Ask general business, catalog, or contact questions.',
      icon: MessageSquareText,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HERO SECTION */}
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
              Trade & Distribution Enquiries
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Become a Mehak Dealer
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Interested in dealing in Mehak sanitary hardware? Send us your business enquiry and our team can connect with you.
          </p>

          {/* Quick WhatsApp Banner in Hero */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="whatsapp"
              size="md"
              href={companyData.contact.whatsappUrl}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Prefer WhatsApp? Chat with us on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 1 — HOW CAN WE HELP? (5 CARDS) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Enquiry Options"
            title="How Can We Help?"
            description="Select the enquiry type that best matches your business or product requirements."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {helpTypes.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="p-6 flex flex-col h-full bg-slate-50/60 border border-slate-200/80 hover:border-slate-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6 flex-1">
                    {item.description}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => handleOpenHelpCard(item.title)}
                    className="mt-auto text-xs"
                  >
                    Enquire
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Direct Phone Helpline Strip */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <Phone className="w-5 h-5 text-slate-800 shrink-0 hidden sm:block" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Direct Trade Helplines:</span>
                <span className="text-xs text-slate-600">Call our sales representatives directly</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {companyData.contact.phoneNumbers.map((phone, idx) => (
                <a
                  key={idx}
                  href={`tel:${phone}`}
                  className="px-3 py-1 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 rounded-lg text-xs font-mono font-bold transition-colors"
                >
                  +91 {phone}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DEALER ENQUIRY FORM */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Official Form"
            title="Business Enquiry Form"
            description="Fill in your location, business type, and interested product categories below."
            align="center"
          />

          <DealerEnquiryForm />
        </div>
      </section>

      {/* SECTION 3 — BULK & BUSINESS ENQUIRIES */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wider">
            Bulk Supply
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Bulk & Business Enquiries
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            For bulk requirements, retailer enquiries and business enquiries, contact Mehak with your product requirements.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              icon={<Send className="w-5 h-5" />}
            >
              Send Bulk Enquiry
            </Button>
            <Button
              variant="whatsapp"
              size="lg"
              href={companyData.contact.whatsappUrl}
              icon={<MessageSquare className="w-5 h-5" />}
            >
              Chat on WhatsApp (+91 {companyData.contact.whatsapp})
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FAQ SECTION */}
      <FAQSection />

      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCategory={modalCategory}
      />
    </div>
  );
}
