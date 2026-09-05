'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Package,
  MessageSquare,
  Clock,
  Save,
  RefreshCw,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
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
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/admin/enquiries');
      }
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading Lead Profile...</span>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700">Enquiry record not found.</p>
        <Button variant="outline" size="sm" href="/admin/enquiries">
          Return to Customer Leads Inbox
        </Button>
      </div>
    );
  }

  const initial = enquiry.name ? enquiry.name.charAt(0).toUpperCase() : 'C';
  const cleanPhone = enquiry.phone ? enquiry.phone.replace(/\D/g, '') : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer Leads Inbox
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          icon={<Trash2 className="w-3.5 h-3.5" />}
        >
          {deleting ? 'Deleting...' : 'Delete Lead'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-2xs">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {enquiry.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 uppercase tracking-wider border border-slate-200">
                  {enquiry.businessType || 'Lead'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Submitted on {new Date(enquiry.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status Update Dropdown Form */}
          <form onSubmit={handleUpdateStatus} className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-extrabold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
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
              icon={updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            >
              {updating ? 'Saving...' : 'Update Status'}
            </Button>
          </form>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Enquiry status updated to <strong>{enquiry.status}</strong>.</span>
          </div>
        )}

        {/* Quick Contact Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Quick Connect</span>
            <span className="text-sm font-extrabold text-white">Directly reach out to this customer</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`tel:${enquiry.phone}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold transition-colors border border-slate-700"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Now</span>
            </a>

            {cleanPhone && (
              <a
                href={`https://wa.me/91${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-colors shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}

            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold transition-colors border border-slate-700"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Email</span>
              </a>
            )}
          </div>
        </div>

        {/* Lead Customer Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200/80">
              Customer Contact Details
            </h3>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Full Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{enquiry.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Phone Number</span>
                <a href={`tel:${enquiry.phone}`} className="font-mono font-extrabold text-slate-900 hover:underline text-sm">
                  +91 {enquiry.phone}
                </a>
              </div>
            </div>

            {enquiry.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Email Address</span>
                  <a href={`mailto:${enquiry.email}`} className="font-mono text-xs font-bold text-slate-900 hover:underline">
                    {enquiry.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200/80">
              Business & Location Context
            </h3>

            {enquiry.companyName && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Company / Firm</span>
                  <span className="font-extrabold text-slate-900 text-sm">{enquiry.companyName}</span>
                </div>
              </div>
            )}

            {enquiry.city && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">City / Location</span>
                  <span className="font-extrabold text-slate-900 text-sm">{enquiry.city}</span>
                </div>
              </div>
            )}

            {enquiry.quantity && (
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimated Quantity</span>
                  <span className="font-bold text-slate-900 text-xs">{enquiry.quantity}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product / Interest Banner */}
        {enquiry.product && (
          <div className="p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Product Inquiry Target</span>
                <span className="font-black text-white text-base">{enquiry.product}</span>
              </div>
            </div>
          </div>
        )}

        {/* Message Body */}
        <div className="space-y-2 pt-2">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
            Customer Requirement / Message
          </h3>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 text-sm leading-relaxed font-sans whitespace-pre-wrap font-medium">
            {enquiry.message}
          </div>
        </div>
      </div>
    </div>
  );
}
