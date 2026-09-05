'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EnquiryModal } from '@/components/ui/EnquiryModal';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Phone, MessageSquare, Mail, MapPin, Send, CheckCircle2, ExternalLink, ArrowUpRight } from 'lucide-react';

export default function ContactPage() {
  const settings = useBusinessSettings();
  const phoneNumbers = [settings.phonePrimary, settings.phoneSecondary, settings.phoneTertiary].filter(Boolean) as string[];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          city: city || undefined,
          email: email || undefined,
          enquiryType: 'Direct Contact Form',
          message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Enquiry submission failed. Please check inputs.');
      }
    } catch (err) {
      console.error('Contact form API error:', err);
      alert('Network error. Please try submitting again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                alt={`${settings.brand} Logo`}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {settings.name} Contact
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Get in Touch with {settings.brand}
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {settings.tagline} — Have a product, dealer or bulk requirement? Send us an enquiry.
          </p>
        </div>
      </section>

      {/* CONTACT CARDS & FORM CONTAINER */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Official Contact Cards Column */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Official Contact Channels</h3>

              {/* Call Us Card */}
              <Card className="p-5 flex items-start gap-4 bg-white border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Call Us</h4>
                  <div className="space-y-1.5">
                    {phoneNumbers.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone}`}
                        className="block text-xs font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-900 hover:text-white px-2.5 py-1 rounded transition-colors"
                      >
                        +91 {phone}
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Tappable helpline numbers.</p>
                </div>
              </Card>

              {/* WhatsApp Card */}
              {settings.whatsapp && (
                <Card className="p-5 flex items-start gap-4 bg-white border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">WhatsApp Business</h4>
                    <div className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded inline-block">
                      +91 {settings.whatsapp}
                    </div>
                    <div>
                      <Button
                        variant="whatsapp"
                        size="sm"
                        href={`https://wa.me/91${settings.whatsapp}`}
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        className="text-xs py-1.5"
                      >
                        Chat on WhatsApp
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Email Card */}
              {settings.email && (
                <Card className="p-5 flex items-start gap-4 bg-white border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">Email</h4>
                    <a
                      href={`mailto:${settings.email.trim()}`}
                      className="text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 px-2.5 py-1 rounded inline-block break-all transition-colors"
                    >
                      {settings.email.trim()}
                    </a>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`mailto:${settings.email.trim()}`}
                        className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-1.5 gap-1.5 bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm hover:shadow-md active:translate-y-0.5 text-xs"
                      >
                        Send Mail (App)
                        <span className="inline-flex shrink-0"><ExternalLink className="w-3.5 h-3.5" /></span>
                      </a>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(settings.email.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-1.5 gap-1.5 bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-sm hover:shadow-md active:translate-y-0.5 text-xs"
                      >
                        Open Gmail Web
                        <span className="inline-flex shrink-0"><ExternalLink className="w-3.5 h-3.5" /></span>
                      </a>
                    </div>
                  </div>
                </Card>
              )}

              {/* Address Card */}
              <Card className="p-5 flex items-start gap-4 bg-white border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Factory & Office Address</h4>
                  <div className="text-xs font-semibold text-slate-700 bg-slate-100 p-2.5 rounded">
                    {settings.address}, {settings.city}, {settings.state} - {settings.pincode}, {settings.country}
                  </div>
                  {settings.googleMapsUrl && (
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                    >
                      <span>Open Google Maps Location</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </Card>
            </div>

            {/* Direct Contact Form Column */}
            <div className="lg:col-span-7">
              <Card className="p-6 sm:p-10 bg-white border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xl text-slate-900 mb-2">Send Direct Enquiry</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Fill in your enquiry details below and our sales team will respond.
                </p>

                {submitted ? (
                  <div className="py-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">Enquiry Received</h4>
                    <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
                      Thank you for reaching out to <strong>Hari Har Industries — Mehak</strong>.
                    </p>
                    <Button variant="primary" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Enter your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          City / Location
                        </label>
                        <input
                          type="text"
                          placeholder="Enter city or location"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          placeholder="Enter email address (optional)"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Message / Business Enquiry <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Enter your requirements or product details..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="metallic"
                        size="lg"
                        type="submit"
                        disabled={isSubmitting}
                        fullWidth
                        icon={<Send className="w-4 h-4" />}
                      >
                        {isSubmitting ? 'Sending Enquiry...' : 'Submit Enquiry'}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
