'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Filter, Eye, RefreshCw, Search, Trash2, CheckCircle2, Phone, Mail, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EnquiryRecord {
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
  message?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let url = '/api/enquiries';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  // Client-side multi-field search (Name, Phone, Company, Product)
  const filteredEnquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return enquiries;

    return enquiries.filter((item) => {
      const matchName = item.name.toLowerCase().includes(query);
      const matchPhone = item.phone.toLowerCase().includes(query);
      const matchCompany = item.companyName?.toLowerCase().includes(query) || false;
      const matchProduct = item.product?.toLowerCase().includes(query) || false;
      return matchName || matchPhone || matchCompany || matchProduct;
    });
  }, [enquiries, searchQuery]);

  // Quick Status Update Handler
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
    }
  };

  // Delete Enquiry Handler
  const handleDeleteEnquiry = async (id: string, customerName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the enquiry from "${customerName}"?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEnquiries((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert('Failed to delete enquiry. Make sure you are authenticated.');
      }
    } catch (err) {
      console.error('Delete enquiry error:', err);
      alert('Error deleting enquiry.');
    } finally {
      setDeletingId(null);
    }
  };

  const statusOptions = ['all', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Leads Inbox</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
              {enquiries.length} Enquiries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review customer product requests, dealer inquiries, and directly contact leads via Call or WhatsApp.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchEnquiries}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Inbox
        </Button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusOptions.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st === 'all' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, company, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-semibold">Loading customer enquiries...</span>
          </div>
        ) : filteredEnquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Phone Contact</th>
                  <th className="px-5 py-3.5">Target Product</th>
                  <th className="px-5 py-3.5">Company / City</th>
                  <th className="px-5 py-3.5">Business Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Quick Contact & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEnquiries.map((enq) => {
                  const initial = enq.name ? enq.name.charAt(0).toUpperCase() : 'C';
                  const cleanPhone = enq.phone ? enq.phone.replace(/\D/g, '') : '';
                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Customer Name */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div>
                            <span className="block text-sm font-extrabold">{enq.name}</span>
                            {enq.email && <span className="text-[10px] text-slate-400 font-mono block">{enq.email}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                        <a href={`tel:${enq.phone}`} className="hover:underline text-blue-600">
                          +91 {enq.phone}
                        </a>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4 text-xs font-bold text-slate-900 max-w-[150px] truncate">
                        {enq.product || 'General Inquiry'}
                      </td>

                      {/* Company / City */}
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        <span>{enq.companyName || enq.city || '—'}</span>
                      </td>

                      {/* Business Type */}
                      <td className="px-5 py-4 text-[11px] uppercase tracking-wider text-slate-600 font-bold whitespace-nowrap">
                        {enq.businessType || 'Customer'}
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border outline-none cursor-pointer transition-colors ${
                            enq.status === 'NEW'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : enq.status === 'CONTACTED'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : enq.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : enq.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Call Button */}
                          <a
                            href={`tel:${enq.phone}`}
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-200"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp Button */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-2xs"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* View Details Button */}
                          <Link
                            href={`/admin/enquiries/${enq.id}`}
                            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors border border-slate-200"
                            title="View Full Lead Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteEnquiry(enq.id, enq.name)}
                            disabled={deletingId === enq.id}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-200"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs">
            No customer enquiries match the selected filter or search query.
          </div>
        )}
      </div>
    </div>
  );
}
