'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, RefreshCw, X, Save, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        alert('Failed to delete category. Ensure no products depend on it.');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');

    const payload = {
      name,
      slug: slug.trim() || undefined,
      description,
    };

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save category.');
        setSaving(false);
        return;
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Connection error while saving category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize sanitary hardware items into clear product lines and series.
          </p>
        </div>

        <Button
          variant="metallic"
          size="md"
          onClick={handleOpenAddModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-semibold">Loading category structure...</span>
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">URL Slug</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Linked Products</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                          <FolderTree className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-extrabold">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-600 border border-slate-200">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900 text-white shadow-2xs">
                        {cat._count?.products || 0} Products
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          title="Delete Category"
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
          <div className="py-16 text-center text-slate-500 text-xs">No categories found in database.</div>
        )}
      </div>

      {/* Add / Edit Category Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Faucets & Sprays"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. health-faucets"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide brief summary of products under this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none resize-none font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="metallic"
                  size="sm"
                  type="submit"
                  disabled={saving}
                  icon={saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  {saving ? 'Saving Category...' : 'Save Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
