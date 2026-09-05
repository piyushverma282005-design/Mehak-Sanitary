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
  Settings,
  PhoneCall,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalEnquiries: number;
  newEnquiries: number;
  contactedEnquiries: number;
  inProgressEnquiries: number;
  completedEnquiries: number;
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
      const categoriesCount = categories.length;

      const totalEnquiries = enquiries.length;
      const newEnquiries = enquiries.filter((e: any) => e.status === 'NEW').length;
      const contactedEnquiries = enquiries.filter((e: any) => e.status === 'CONTACTED').length;
      const inProgressEnquiries = enquiries.filter((e: any) => e.status === 'IN_PROGRESS').length;
      const completedEnquiries = enquiries.filter((e: any) => e.status === 'COMPLETED').length;

      setMetrics({
        totalProducts,
        activeProducts,
        featuredProducts,
        totalEnquiries,
        newEnquiries,
        contactedEnquiries,
        inProgressEnquiries,
        completedEnquiries,
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
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold">Fetching Live Dashboard Metrics...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customer Enquiries',
      value: metrics?.totalEnquiries || 0,
      icon: Inbox,
      gradient: 'from-blue-600 to-indigo-600 text-white',
      trend: `${metrics?.newEnquiries || 0} pending review`,
      link: '/admin/enquiries',
    },
    {
      title: 'New Leads (Action Required)',
      value: metrics?.newEnquiries || 0,
      icon: Clock,
      gradient: 'from-rose-500 to-pink-600 text-white',
      trend: 'Fresh submissions',
      link: '/admin/enquiries?status=NEW',
    },
    {
      title: 'Contacted Leads',
      value: metrics?.contactedEnquiries || 0,
      icon: PhoneCall,
      gradient: 'from-indigo-500 to-purple-600 text-white',
      trend: 'Follow-ups initiated',
      link: '/admin/enquiries?status=CONTACTED',
    },
    {
      title: 'Completed Deals',
      value: metrics?.completedEnquiries || 0,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600 text-white',
      trend: 'Closed inquiries',
      link: '/admin/enquiries?status=COMPLETED',
    },
    {
      title: 'Product Catalogue Items',
      value: metrics?.totalProducts || 0,
      icon: Package,
      gradient: 'from-slate-800 to-slate-950 text-white',
      trend: `${metrics?.activeProducts || 0} active on website`,
      link: '/admin/products',
    },
    {
      title: 'Product Categories',
      value: metrics?.categoriesCount || 0,
      icon: FolderTree,
      gradient: 'from-amber-500 to-orange-600 text-white',
      trend: `${metrics?.featuredProducts || 0} featured products`,
      link: '/admin/categories',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operations dashboard for Mehak Sanitary Hardware.
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

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/products/new"
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700">Add Product</h4>
            <p className="text-[10px] text-slate-500">Create new item</p>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-700">Categories</h4>
            <p className="text-[10px] text-slate-500">Organize catalogue</p>
          </div>
        </Link>

        <Link
          href="/admin/enquiries"
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700">Customer Leads</h4>
            <p className="text-[10px] text-slate-500">View enquiries</p>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700">Settings</h4>
            <p className="text-[10px] text-slate-500">Business details</p>
          </div>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {card.title}
                  </span>
                  <span className="text-3xl font-black text-slate-900 mt-2 block tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{card.trend}</span>
                <span className="text-slate-900 font-bold group-hover:underline inline-flex items-center gap-1">
                  View details <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-900" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Customer Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Recent Leads & Customer Enquiries</h3>
            <p className="text-xs text-slate-500">Direct inquiries from website visitors and dealers</p>
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
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5">Category / Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Received Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {metrics.recentEnquiries.map((enq) => {
                  const initial = enq.name ? enq.name.charAt(0).toUpperCase() : 'C';
                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{enq.name}</span>
                            <span className="text-[10px] text-slate-400">{enq.businessType || 'General Customer'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                        <a href={`tel:${enq.phone}`} className="hover:underline">
                          +91 {enq.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{enq.enquiryType || 'Product Inquiry'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
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
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/enquiries/${enq.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">No customer enquiries recorded in database yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
