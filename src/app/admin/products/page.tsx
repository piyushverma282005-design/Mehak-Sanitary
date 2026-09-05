'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Trash2, Star, CheckCircle2, XCircle, RefreshCw, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categoryId: string;
  featured: boolean;
  available: boolean;
  material?: string;
  image?: string | null;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      const prodData = resProd.ok ? await resProd.json() : [];
      const catData = resCat.ok ? await resCat.json() : [];

      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory || p.categoryName === selectedCategory;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      query === '' || p.name.toLowerCase().includes(query) || p.categoryName.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalogue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
              {products.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your sanitary hardware products, pricing, categories, and image gallery.
          </p>
        </div>

        <Button
          variant="metallic"
          size="md"
          href="/admin/products/new"
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:w-64">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none font-bold"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Loading product database...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Product Info</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Featured Status</th>
                  <th className="px-6 py-3.5">Catalog Status</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50 shadow-2xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-extrabold text-slate-400 shrink-0">
                            <Package className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">{p.name}</span>
                          {p.material && (
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {p.material}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {p.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.featured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.available ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200">
                          <XCircle className="w-3.5 h-3.5" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          title="Delete Product"
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
            No products match your search or filter parameters.
          </div>
        )}
      </div>
    </div>
  );
}
