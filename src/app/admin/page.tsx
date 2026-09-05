'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Star,
  Inbox,
  Clock,
  FolderTree,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalEnquiries: number;
  newEnquiries: number;
  categoriesCount: number;
  recentEnquiries: Array<{
    id: string;
    name: string;
    phone: string;
    businessType?: string;
    enquiryType?: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products, categories, and enquiries in parallel
      const [resProd, resCat, resEnq] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/enquiries'),
      ]);

      const products = resProd.ok ? await resProd.json() : [];
      const categories = resCat.ok ? await resCat.json() : [];
      const enquiries = resEnq.ok ? await resEnq.json() : [];

      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.available).length;
      const featuredProducts = products.filter((p: any) => p.featured || p.isFeatured).length;
      const totalEnquiries = enquiries.length;
      const newEnquiries = enquiries.filter((e: any) => e.status === 'NEW').length;
      const categoriesCount = categories.length;

      setMetrics({
        totalProducts,
        activeProducts,
        featuredProducts,
        totalEnquiries,
        newEnquiries,
        categoriesCount,
        recentEnquiries: enquiries.slice(0, 5),
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span>Loading Real Database Metrics...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: metrics?.totalProducts || 0,
      icon: Package,
      color: 'bg-slate-900 text-white',
      link: '/admin/products',
    },
    {
      title: 'Active Products',
      value: metrics?.activeProducts || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-600 text-white',
      link: '/admin/products',
    },
    {
      title: 'Featured Products',
      value: metrics?.featuredProducts || 0,
      icon: Star,
      color: 'bg-amber-500 text-white',
      link: '/admin/products?featured=true',
    },
    {
      title: 'Total Enquiries',
      value: metrics?.totalEnquiries || 0,
      icon: Inbox,
      color: 'bg-blue-600 text-white',
      link: '/admin/enquiries',
    },
    {
      title: 'New Enquiries',
      value: metrics?.newEnquiries || 0,
      icon: Clock,
      color: 'bg-rose-600 text-white',
      link: '/admin/enquiries?status=NEW',
    },
    {
      title: 'Categories',
      value: metrics?.categoriesCount || 0,
      icon: FolderTree,
      color: 'bg-slate-700 text-white',
      link: '/admin/categories',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business metrics from PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDashboardData}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="metallic"
            size="sm"
            href="/admin/products/new"
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    {card.title}
                  </span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">
                    {card.value}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Customer Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Leads & Enquiries</h3>
            <p className="text-xs text-slate-500">Latest customer submissions</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            href="/admin/enquiries"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            View All Enquiries
          </Button>
        </div>

        {metrics?.recentEnquiries && metrics.recentEnquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Customer Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {metrics.recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{enq.name}</td>
                    <td className="px-6 py-3.5 font-mono text-xs">{enq.phone}</td>
                    <td className="px-6 py-3.5 text-xs">{enq.enquiryType || 'General'}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          enq.status === 'NEW'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : enq.status === 'CONTACTED'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : enq.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/admin/enquiries/${enq.id}`}
                        className="text-xs font-semibold text-slate-900 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No customer enquiries recorded in database yet.
          </div>
        )}
      </div>
    </div>
  );
}
