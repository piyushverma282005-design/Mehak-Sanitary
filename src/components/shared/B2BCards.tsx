'use client';

import React, { useState } from 'react';
import { Store, Building2, Truck, Boxes, Send } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EnquiryModal } from '../ui/EnquiryModal';
import { BusinessType } from '@/types';

export const B2BCards: React.FC = () => {
  const [selectedIntent, setSelectedIntent] = useState<BusinessType | undefined>(undefined);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const handleOpenModal = (intent: BusinessType) => {
    setSelectedIntent(intent);
    setIsEnquiryOpen(true);
  };

  const b2bOptions = [
    {
      type: 'retailer' as BusinessType,
      title: 'Retailers',
      description: 'For sanitaryware and hardware shops looking to stock Mehak fittings.',
      icon: Store,
    },
    {
      type: 'dealer' as BusinessType,
      title: 'Dealers',
      description: 'For hardware businesses interested in regional dealing of Mehak products.',
      icon: Building2,
    },
    {
      type: 'distributor' as BusinessType,
      title: 'Distributors',
      description: 'For larger business and regional distribution network enquiries.',
      icon: Truck,
    },
    {
      type: 'bulk-buyer' as BusinessType,
      title: 'Bulk Buyers',
      description: 'For building contractors and customers requiring products in larger quantities.',
      icon: Boxes,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="B2B Supply Channels"
          title="Looking for Sanitary Hardware Supply?"
          description="Connect with Hari Har Industries for trade supply, dealer inquiries, and bulk sanitary hardware orders."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {b2bOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.type} className="p-6 flex flex-col h-full bg-white">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-5 shadow-xs">
                  <Icon className="w-6 h-6 text-slate-100" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{option.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                  {option.description}
                </p>
                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <Button
                    variant="metallic"
                    size="sm"
                    fullWidth
                    onClick={() => handleOpenModal(option.type)}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send Enquiry
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => {
          setIsEnquiryOpen(false);
          setSelectedIntent(undefined);
        }}
      />
    </section>
  );
};
