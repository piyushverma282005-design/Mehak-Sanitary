'use client';

import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { EnquiryModal } from '../ui/EnquiryModal';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

export const BusinessCTA: React.FC = () => {
  const settings = useBusinessSettings();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-slate-700/30 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wider">
          Dealer & Bulk Orders
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Looking for Quality Sanitary Hardware?
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Connect with {settings.brand} for product enquiries, dealer requirements and bulk orders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsEnquiryOpen(true)}
            icon={<Send className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Send Enquiry
          </Button>

          {settings.whatsapp && (
            <Button
              variant="whatsapp"
              size="lg"
              href={`https://wa.me/91${settings.whatsapp}`}
              icon={<MessageSquare className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              WhatsApp Us (+91 {settings.whatsapp})
            </Button>
          )}
        </div>
      </div>

      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} />
    </section>
  );
};
