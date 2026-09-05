'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Upload,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { compressImageFile } from '@/lib/imageCompression';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [specifications, setSpecifications] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch((err) => console.error('Category fetch error:', err));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const compressedFile = await compressImageFile(file);
      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to upload image.');
        setUploading(false);
        return;
      }

      setImage(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Connection error during image upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSpec = () => {
    setSpecifications([...specifications, { label: '', value: '' }]);
  };

  const handleSpecChange = (index: number, key: 'label' | 'value', val: string) => {
    const updated = [...specifications];
    updated[index][key] = val;
    setSpecifications(updated);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !description.trim()) {
      setError('Product Name, Category, and Description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug.trim() || undefined,
          categoryId,
          shortDescription,
          description,
          material,
          featured,
          available,
          image,
          specifications: specifications.filter((s) => s.label.trim() && s.value.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create product.');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      console.error('Create product error:', err);
      setError('Connection error during product creation.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogue
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Product</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in the specifications and image details to publish a new sanitary hardware item.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-4 h-4 text-slate-800" />
              <h3 className="font-extrabold text-slate-900 text-sm">General Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Brass Angle Valve"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL Slug (Auto-generated if empty)
                </label>
                <input
                  type="text"
                  placeholder="brass-angle-valve"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Material / Finish
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chrome Plated Brass / 304 Stainless Steel"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Tagline / Summary
              </label>
              <input
                type="text"
                placeholder="High durability 1/2 inch ceramic cartridge angle valve"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide detailed description of product features, build quality, water flow specification, and applications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: PRODUCT IMAGE UPLOAD DROPZONE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-800" />
                <h3 className="font-extrabold text-slate-900 text-sm">Product Photo Gallery</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Main Display Image</span>
            </div>

            {image ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-sm shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Image Processed & Uploaded</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    This photo will be displayed on product listing cards, search results, and details pages.
                  </p>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-300" />
                      <span>{uploading ? 'Compressing...' : 'Change Image'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-8 text-center bg-slate-50/60 space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                  <Upload className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-extrabold cursor-pointer transition-colors shadow-md">
                    <span>{uploading ? 'Processing Image...' : 'Select Product Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Supports high quality JPEG, PNG, WEBP, or AVIF images up to 5MB. Automatic optimization applied.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: SPECIFICATIONS LIST */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-800" />
                <h3 className="font-extrabold text-slate-900 text-sm">Technical Specifications</h3>
              </div>
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add Spec Line
              </button>
            </div>

            {specifications.length > 0 ? (
              <div className="space-y-2">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Thread Size)"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                      className="w-1/2 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 1/2 Inch Male)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      className="w-1/2 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specifications added yet. Click &quot;Add Spec Line&quot; to add technical details.</p>
            )}
          </div>

          {/* SECTION 4: CATALOGUE VISIBILITY & FEATURED STATUS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Catalogue Visibility & Badges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Featured Product</span>
                  <span className="text-[11px] text-slate-500 block">Highlight on Homepage featured carousel</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Active in Catalogue</span>
                  <span className="text-[11px] text-slate-500 block">Visible to customers on public website</span>
                </div>
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTON BAR */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" href="/admin/products">
              Cancel
            </Button>
            <Button
              variant="metallic"
              size="md"
              type="submit"
              disabled={loading || uploading}
              icon={<Save className="w-4 h-4" />}
            >
              {loading ? 'Publishing...' : 'Save Product to Database'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
