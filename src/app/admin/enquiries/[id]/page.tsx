'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Building2, MapPin, Package, MessageSquare, Clock, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EnquiryDetail {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  companyName?: string;
  businessType?: string;
  enquiryType?: string;
  product?: string;
  quantity?: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function EnquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('NEW');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadEnquiry() {
      try {
        const res = await fetch(`/api/enquiries/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEnquiry(data);
          setStatus(data.status);
        }
      } catch (err) {
        console.error('Error loading enquiry detail:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadEnquiry();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);

    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEnquiry(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error updating enquiry status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading Lead Record...</span>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-700">Enquiry record not found.</p>
        <Button variant="outline" size="sm" href="/admin/enquiries">
          Return to Enquiries List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer Enquiries
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-2xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {enquiry.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 uppercase tracking-wider">
                {enquiry.businessType || 'Lead'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submitted on {new Date(enquiry.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Status Update Dropdown Form */}
          <form onSubmit={handleUpdateStatus} className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none"
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <Button
              variant="metallic"
              size="sm"
              type="submit"
              disabled={updating}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </form>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
            Enquiry status updated to <strong>{enquiry.status}</strong>.
          </div>
        )}

        {/* Lead Customer Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Customer Contact Details
            </h3>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-xs text-slate-400 block">Name</span>
                <span className="font-semibold text-slate-900">{enquiry.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-xs text-slate-400 block">Phone</span>
                <a href={`tel:${enquiry.phone}`} className="font-mono font-bold text-slate-900 hover:underline">
                  +91 {enquiry.phone}
                </a>
              </div>
            </div>

            {enquiry.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs text-slate-400 block">Email</span>
                  <a href={`mailto:${enquiry.email}`} className="font-semibold text-slate-900 hover:underline">
                    {enquiry.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Business & Location Context
            </h3>

            {enquiry.companyName && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs text-slate-400 block">Company / Firm</span>
                  <span className="font-semibold text-slate-900">{enquiry.companyName}</span>
                </div>
              </div>
            )}

            {enquiry.city && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs text-slate-400 block">City / Location</span>
                  <span className="font-semibold text-slate-900">{enquiry.city}</span>
                </div>
              </div>
            )}

            {enquiry.quantity && (
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-xs text-slate-400 block">Estimated Quantity</span>
                  <span className="font-semibold text-slate-900">{enquiry.quantity}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product / Interest Banner */}
        {enquiry.product && (
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-slate-300" />
              <div>
                <span className="text-xs text-slate-400 block">Inquiring Regarding Product:</span>
                <span className="font-bold text-white text-base">{enquiry.product}</span>
              </div>
            </div>
          </div>
        )}

        {/* Message Body */}
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Enquiry Details & Message
          </h3>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed font-sans whitespace-pre-wrap">
            {enquiry.message}
          </div>
        </div>
      </div>
    </div>
  );
}
