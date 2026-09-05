import React from 'react';
import { Phone, MessageSquare, Mail, MapPin, ExternalLink } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { companyData } from '@/data/company';

export const ContactPreview: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Get in Touch"
          title="Connect with Mehak"
          description="Reach out directly via phone, WhatsApp, or email for product inquiries, dealer pricing, and bulk hardware supply."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Phone Numbers Card */}
          <Card className="p-6 flex flex-col h-full bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Phone Helplines</h3>
            <div className="space-y-1.5 mb-3">
              {companyData.contact.phoneNumbers.map((phone, idx) => (
                <a
                  key={idx}
                  href={`tel:${phone}`}
                  className="block text-xs font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                >
                  +91 {phone}
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-auto">Click any number to call directly.</p>
          </Card>

          {/* WhatsApp Card */}
          <Card className="p-6 flex flex-col h-full bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">WhatsApp Business</h3>
            <a
              href={companyData.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded border border-emerald-200 transition-colors mb-3"
            >
              <span>+91 {companyData.contact.whatsapp}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-xs text-slate-500 mt-auto">Instant messaging for product queries.</p>
          </Card>

          {/* Email Card */}
          <Card className="p-6 flex flex-col h-full bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Official Email</h3>
            <a
              href={`mailto:${companyData.contact.email}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded border border-slate-200 transition-colors mb-3"
            >
              <span className="break-all">{companyData.contact.email}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <p className="text-xs text-slate-500 mt-auto">Click to email official inquiries.</p>
          </Card>

          {/* Location Card */}
          <Card className="p-6 flex flex-col h-full bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Business Address</h3>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded mb-3">
              {companyData.contact.address}
            </div>
            <p className="text-xs text-slate-500 mt-auto">Address will be added when provided.</p>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="outline" size="md" href="/contact">
            View Full Contact Page
          </Button>
        </div>
      </div>
    </section>
  );
};
