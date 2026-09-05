'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Send, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from './Button';
import { EnquiryFormData } from '@/types';
import { productsData } from '@/data/products';

export interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
  productName?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = '',
  productName = '',
}) => {
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    customerType: 'dealer',
    categoryInterest: defaultCategory || 'all',
    productName: productName || '',
    quantity: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    companyName?: string;
    quantity?: string;
  }>({});

  useEffect(() => {
    if (productName || defaultCategory) {
      setFormData((prev) => ({
        ...prev,
        productName: productName || prev.productName,
        categoryInterest: defaultCategory || prev.categoryInterest,
      }));
    }
  }, [productName, defaultCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: {
      name?: string;
      phone?: string;
      companyName?: string;
      quantity?: string;
    } = {};

    // 1. Full Name: Required, letters and spaces only, min 2 characters.
    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed || nameTrimmed.length < 2 || !/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      newErrors.name = 'Please enter a valid full name.';
    }

    // 2. Phone Number: Required, valid Indian 10-digit mobile number.
    const phoneClean = formData.phone.trim().replace(/^(\+91|91|0)/, '').replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    // 3. Company / Store Name: Required, min 2 chars, must contain letters, no only-numbers or special chars.
    const companyTrimmed = formData.companyName?.trim() || '';
    if (
      !companyTrimmed ||
      companyTrimmed.length < 2 ||
      !/[a-zA-Z]/.test(companyTrimmed) ||
      !/^[a-zA-Z0-9\s&'.-]+$/.test(companyTrimmed)
    ) {
      newErrors.companyName = 'Please enter a valid company or store name.';
    }

    // 4. Estimated Quantity: Required, positive whole number.
    const quantityTrimmed = formData.quantity?.trim() || '';
    if (!quantityTrimmed || !/^[1-9]\d*$/.test(quantityTrimmed)) {
      newErrors.quantity = 'Please enter a valid quantity.';
    }

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
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || undefined,
          companyName: formData.companyName?.trim() || undefined,
          businessType: formData.customerType,
          enquiryType: formData.productName ? 'Product Enquiry' : 'General Enquiry',
          product: formData.productName || undefined,
          quantity: formData.quantity?.trim() || undefined,
          message: formData.message?.trim() || 'Product enquiry submitted via modal',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Enquiry submission failed. Please check inputs and try again.');
      }
    } catch (err) {
      console.error('Enquiry API error:', err);
      alert('Network error. Please try submitting again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrors({});
    setFormData({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      customerType: 'dealer',
      categoryInterest: 'all',
      productName: '',
      quantity: '',
      message: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-slate-700 shrink-0">
              <Image
                src="/images/mehak-logo.png"
                alt="Mehak - Hari Har Industries"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Product & Business Enquiry</h3>
              <p className="text-xs text-slate-300">Mehak by Hari Har Industries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Enquiry Received</h4>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Thank you for connecting with <strong>Hari Har Industries</strong>. Our sales team will respond with product details and business pricing shortly.
            </p>
            <Button variant="primary" onClick={handleReset}>
              Close & Return
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Selected Product Banner */}
            {formData.productName ? (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-800 border border-slate-200 flex items-center justify-between">
                <div>
                  Enquiring regarding: <span className="font-bold text-slate-900">{formData.productName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, productName: '' })}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product (Optional)
                </label>
                <select
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                >
                  <option value="">General Product Enquiry</option>
                  {productsData.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.categoryName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${
                    errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${
                    errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter company or store name"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${
                    errors.companyName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter estimated quantity"
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: e.target.value });
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${
                    errors.quantity ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.quantity}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  I am a...
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerType: e.target.value as EnquiryFormData['customerType'],
                    })
                  }
                  className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                >
                  <option value="dealer">Hardware Dealer / Stockist</option>
                  <option value="distributor">Regional Distributor</option>
                  <option value="retailer">Sanitaryware Retailer</option>
                  <option value="contractor">Building Contractor</option>
                  <option value="end-user">Homeowner / End User</option>
                  <option value="other">Other Inquiry</option>
                </select>
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
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Message / Specification Details
              </label>
              <textarea
                rows={3}
                placeholder="Enter your requirements or product details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                variant="metallic"
                size="md"
                type="submit"
                disabled={isSubmitting}
                icon={<Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Submitting...' : 'Send Enquiry'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
