'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { CompanySettings } from '@/types';
import {
  Building2,
  Landmark,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await DataStore.getCompanySettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await DataStore.updateCompanySettings(settings);
      setSettings(updated);
      setSuccessMsg('Company settings updated successfully! New invoices will automatically use these details.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update company settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <Header
        title="Company & Billing Settings"
        subtitle="Manage seller company profile, bank account details, invoice numbering prefix, and terms"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Business Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Building2 className="h-4 w-4" /> 1. Business / Seller Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Seller Company Name *</label>
                <input
                  type="text"
                  required
                  value={settings?.company_name || ''}
                  onChange={(e) => setSettings({ ...settings!, company_name: e.target.value })}
                  placeholder="SHRINIVAS ENTERPRISE"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Seller GSTIN</label>
                <input
                  type="text"
                  value={settings?.gstin || ''}
                  onChange={(e) => setSettings({ ...settings!, gstin: e.target.value.toUpperCase() })}
                  placeholder="27AAAAA0000A1Z5"
                  maxLength={15}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">PAN Number</label>
                <input
                  type="text"
                  value={settings?.pan || ''}
                  onChange={(e) => setSettings({ ...settings!, pan: e.target.value.toUpperCase() })}
                  placeholder="AAAAA0000A"
                  maxLength={10}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Street Address</label>
                <input
                  type="text"
                  value={settings?.address || ''}
                  onChange={(e) => setSettings({ ...settings!, address: e.target.value })}
                  placeholder="Plot No. 42, Industrial Area, Sector 2"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  value={settings?.city || ''}
                  onChange={(e) => setSettings({ ...settings!, city: e.target.value })}
                  placeholder="Mumbai"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">State & State Code</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="text"
                    value={settings?.state || ''}
                    onChange={(e) => setSettings({ ...settings!, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="col-span-2 mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={settings?.state_code || ''}
                    onChange={(e) => setSettings({ ...settings!, state_code: e.target.value })}
                    placeholder="27"
                    maxLength={2}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-mono text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Pincode</label>
                <input
                  type="text"
                  value={settings?.pincode || ''}
                  onChange={(e) => setSettings({ ...settings!, pincode: e.target.value })}
                  placeholder="400001"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={settings?.phone || ''}
                  onChange={(e) => setSettings({ ...settings!, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={settings?.email || ''}
                  onChange={(e) => setSettings({ ...settings!, email: e.target.value })}
                  placeholder="sales@shrinivasenterprise.com"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bank Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Landmark className="h-4 w-4" /> 2. Bank Details (For Invoice Payment)
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Bank Name</label>
                <input
                  type="text"
                  value={settings?.bank_name || ''}
                  onChange={(e) => setSettings({ ...settings!, bank_name: e.target.value })}
                  placeholder="HDFC Bank"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Account Number</label>
                <input
                  type="text"
                  value={settings?.bank_account_number || ''}
                  onChange={(e) => setSettings({ ...settings!, bank_account_number: e.target.value })}
                  placeholder="50200012345678"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Branch Name</label>
                <input
                  type="text"
                  value={settings?.bank_branch || ''}
                  onChange={(e) => setSettings({ ...settings!, bank_branch: e.target.value })}
                  placeholder="Fort Branch, Mumbai"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">IFSC Code</label>
                <input
                  type="text"
                  value={settings?.bank_ifsc || ''}
                  onChange={(e) => setSettings({ ...settings!, bank_ifsc: e.target.value.toUpperCase() })}
                  placeholder="HDFC0000123"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Invoice Prefix & Footers */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="h-4 w-4" /> 3. Invoice Numbering & Footer Terms
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={settings?.invoice_prefix || 'SG-'}
                  onChange={(e) => setSettings({ ...settings!, invoice_prefix: e.target.value })}
                  placeholder="SG-"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Next Invoice Number Counter</label>
                <input
                  type="number"
                  min="1"
                  value={settings?.next_invoice_number || 1}
                  onChange={(e) => setSettings({ ...settings!, next_invoice_number: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={settings?.terms_and_conditions || ''}
                  onChange={(e) => setSettings({ ...settings!, terms_and_conditions: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Authorized Signatory Signature Text</label>
                <input
                  type="text"
                  value={settings?.authorized_signatory || ''}
                  onChange={(e) => setSettings({ ...settings!, authorized_signatory: e.target.value })}
                  placeholder="For SHRINIVAS ENTERPRISE"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
