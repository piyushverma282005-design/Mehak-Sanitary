'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BusinessSettingsData, defaultSettings } from '@/lib/settings';

export default function WebsiteSettingsPage() {
  const [formData, setFormData] = useState<BusinessSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setErrorMessage('Failed to load settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: keyof BusinessSettingsData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update settings.');
        setSaving(false);
        return;
      }

      setFormData(data);
      setSuccessMessage('Website Settings updated successfully! Public pages are now updated.');
    } catch (err) {
      console.error('Save settings error:', err);
      setErrorMessage('Connection error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Loading Website Settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Website & Business Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your brand details, phone numbers, WhatsApp, address, and maps dynamically.
          </p>
        </div>

        <Button
          variant="metallic"
          size="md"
          onClick={handleSubmit}
          disabled={saving}
          icon={saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: BUSINESS IDENTITY */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-base">Business Identity & Branding</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Hari Har Industries"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="e.g. Mehak"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tagline / Slogan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="e.g. Complete Bathroom Solution"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Business Overview / Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of Hari Har Industries and Mehak products..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
        </div>

        {/* SECTION 2: CONTACT NUMBERS & EMAIL */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Phone className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-base">Contact Phone Numbers & Emails</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phonePrimary || ''}
                onChange={(e) => handleChange('phonePrimary', e.target.value)}
                placeholder="e.g. 8307721917"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Secondary Phone
              </label>
              <input
                type="text"
                value={formData.phoneSecondary || ''}
                onChange={(e) => handleChange('phoneSecondary', e.target.value)}
                placeholder="e.g. 9354222883"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Phone 3
              </label>
              <input
                type="text"
                value={formData.phoneTertiary || ''}
                onChange={(e) => handleChange('phoneTertiary', e.target.value)}
                placeholder="e.g. 9518405643"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="e.g. 8307721917"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. sales@mehak.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PHYSICAL ADDRESS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-base">Factory & Office Address</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Street Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. Plot No. 12, Industrial Area, Sector 5"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Faridabad"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="Haryana"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pincode <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="121006"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Country <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="India"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: MAPS & LOCATION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Globe className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-base">Google Maps & Location</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Google Maps URL
            </label>
            <input
              type="url"
              value={formData.googleMapsUrl || ''}
              onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
            />
          </div>
        </div>

        {/* SECTION 5: SOCIAL MEDIA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Share2 className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-base">Social Media Profiles</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl || ''}
                onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <Button
            variant="metallic"
            size="lg"
            type="submit"
            disabled={saving}
            icon={saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          >
            {saving ? 'Saving Settings...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
