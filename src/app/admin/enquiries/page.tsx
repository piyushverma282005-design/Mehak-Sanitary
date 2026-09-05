'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Filter, Eye, RefreshCw, Search, Trash2, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Lead & Enquiry Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review customer product requests, dealer leads, and manage lead statuses securely.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchEnquiries}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Leads
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, company, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading customer enquiries...</span>
          </div>
        ) : filteredEnquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Qty</th>
                  <th className="px-5 py-3.5">Business Type</th>
                  <th className="px-5 py-3.5">Enquiry Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer Name */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div>{enq.name}</div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 font-mono text-xs font-semibold whitespace-nowrap">
                      <a href={`tel:${enq.phone}`} className="hover:underline">
                        +91 {enq.phone}
                      </a>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-xs font-mono text-slate-600 max-w-[140px] truncate">
                      {enq.email ? (
                        <a href={`mailto:${enq.email}`} className="hover:underline">
                          {enq.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Company */}
                    <td className="px-5 py-4 text-xs font-medium text-slate-800 max-w-[130px] truncate">
                      {enq.companyName || <span className="text-slate-400">-</span>}
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4 text-xs font-semibold text-slate-900 max-w-[140px] truncate">
                      {enq.product || 'General Enquiry'}
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {enq.quantity || '-'}
                    </td>

                    {/* Business Type */}
                    <td className="px-5 py-4 text-xs uppercase tracking-wider text-slate-600 font-medium whitespace-nowrap">
                      {enq.businessType || 'General'}
                    </td>

                    {/* Enquiry Type */}
                    <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {enq.enquiryType || 'General'}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border outline-none cursor-pointer transition-colors ${
                          enq.status === 'NEW'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : enq.status === 'CONTACTED'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : enq.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : enq.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/enquiries/${enq.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-colors"
                          title="View Lead Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteEnquiry(enq.id, enq.name)}
                          disabled={deletingId === enq.id}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
