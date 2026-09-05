'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DealerEnquiryFormData, BusinessType } from '@/types';
import { categoriesData } from '@/data/categories';

export const DealerEnquiryForm: React.FC = () => {
  const [formData, setFormData] = useState<DealerEnquiryFormData>({
    name: '',
    phone: '',
    city: '',
    businessType: 'dealer',
    message: '',
    shopName: '',
    email: '',
    interestedProducts: [],
    quantity: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleProduct = (productName: string) => {
    setFormData((prev) => {
      const current = prev.interestedProducts || [];
      const updated = current.includes(productName)
        ? current.filter((p) => p !== productName)
        : [...current, productName];
      return { ...prev, interestedProducts: updated };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.city.trim()) newErrors.city = 'City / Location is required';
    if (!formData.message.trim()) newErrors.message = 'Please include a brief message';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          email: formData.email || undefined,
          companyName: formData.shopName || undefined,
          businessType: formData.businessType,
          enquiryType: 'Dealer & Bulk Enquiry',
          product: (formData.interestedProducts || []).join(', ') || undefined,
          quantity: formData.quantity || undefined,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Dealer enquiry submission failed. Please check inputs and try again.');
      }
    } catch (err) {
      console.error('Dealer enquiry API error:', err);
      alert('Network error. Please try submitting again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 sm:p-10 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
          <Building2 className="w-5 h-5 text-slate-100" />
        </div>
        <div>
          <h3 className="font-bold text-lg sm:text-xl text-slate-900">Dealer & Business Form</h3>
          <p className="text-xs text-slate-500">Provide your details to connect with Mehak.</p>
        </div>
      </div>

      {submitted ? (
        <div className="py-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 mb-2">Enquiry Received</h4>
          <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
            Thank you for connecting with <strong>Hari Har Industries</strong>. Our sales & distribution team will review your details and contact you.
          </p>
          <Button variant="primary" onClick={() => setSubmitted(false)}>
            Submit Another Enquiry
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Required Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none ${
                  errors.phone ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-red-500 mt-0.5">{errors.phone}</p>}
            </div>
          </div>

          {/* Required Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter city or location"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none ${
                  errors.city ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.city && <p className="text-[11px] text-red-500 mt-0.5">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessType: e.target.value as BusinessType,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white font-medium"
              >
                <option value="retailer">Retailer</option>
                <option value="dealer">Dealer</option>
                <option value="distributor">Distributor</option>
                <option value="contractor">Contractor</option>
                <option value="bulk-buyer">Bulk Buyer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Optional Fields Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop / Company Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter company or store name"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Interested Products Multi-Select Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Interested Products (Optional - Click to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {categoriesData.map((cat) => {
                const selected = (formData.interestedProducts || []).includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleProduct(cat.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected && '✓ '}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Approximate Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Approximate Quantity (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter estimated quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Required Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message / Details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Enter your requirements or product details..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none ${
                errors.message ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.message && <p className="text-[11px] text-red-500 mt-0.5">{errors.message}</p>}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Button
              variant="metallic"
              size="lg"
              type="submit"
              disabled={isSubmitting}
              fullWidth
              icon={<Send className="w-4 h-4" />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};
