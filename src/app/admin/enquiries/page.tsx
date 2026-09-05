'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, Eye, RefreshCw, Clock } from 'lucide-react';
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
  status: string;
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let url = '/api/enquiries';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('enquiryType', typeFilter);
      if (params.toString()) url += `?${params.toString()}`;

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
  }, [statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Lead & Enquiry Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted product leads, dealer enquiries, and bulk supply requests.
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

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none"
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
            <span className="text-xs">Loading enquiries...</span>
          </div>
        ) : enquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5">Business Type</th>
                  <th className="px-6 py-3.5">Product / Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date Submitted</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{enq.name}</div>
                      {enq.companyName && (
                        <div className="text-[11px] font-normal text-slate-500">{enq.companyName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold">{enq.phone}</td>
                    <td className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-600">
                      {enq.businessType || 'General'}
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate">
                      {enq.product || 'General Enquiry'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          enq.status === 'NEW'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : enq.status === 'CONTACTED'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : enq.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : enq.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/enquiries/${enq.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs">
            No customer enquiries match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
