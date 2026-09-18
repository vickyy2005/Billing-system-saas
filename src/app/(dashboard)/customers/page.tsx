'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { Customer } from '@/types';
import { isValidGSTIN, isValidPAN } from '@/lib/utils/formatters';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const shouldOpenAdd = searchParams.get('add') === 'true';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    company_name: '',
    contact_person: '',
    gstin: '',
    pan: '',
    phone: '',
    alternate_phone: '',
    email: '',
    billing_address: '',
    billing_city: '',
    billing_state: 'Maharashtra',
    billing_state_code: '27',
    billing_pincode: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: 'Maharashtra',
    shipping_state_code: '27',
    shipping_pincode: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (shouldOpenAdd) {
      openAddModal();
    }
  }, [shouldOpenAdd]);

  const loadCustomers = async (query = '') => {
    setLoading(true);
    try {
      const data = await DataStore.getCustomers(query);
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      company_name: '',
      contact_person: '',
      gstin: '',
      pan: '',
      phone: '',
      alternate_phone: '',
      email: '',
      billing_address: '',
      billing_city: '',
      billing_state: 'Maharashtra',
      billing_state_code: '27',
      billing_pincode: '',
      shipping_address: '',
      shipping_city: '',
      shipping_state: 'Maharashtra',
      shipping_state_code: '27',
      shipping_pincode: '',
      notes: '',
    });
    setSameAsBilling(true);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ ...c });
    setSameAsBilling(
      c.billing_address === c.shipping_address &&
      c.billing_city === c.shipping_city &&
      c.billing_state === c.shipping_state
    );
    setError('');
    setModalOpen(true);
  };

  const handleFormChange = (field: keyof Customer, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };

      // Automatically sync PAN from GSTIN if PAN is empty
      if (field === 'gstin' && value.length >= 10 && (!prev.pan || prev.pan.length === 0)) {
        next.pan = value.slice(2, 12).toUpperCase();
      }

      // If "same as billing address" checked, auto sync shipping address fields
      if (sameAsBilling && field.startsWith('billing_')) {
        const shippingField = field.replace('billing_', 'shipping_') as keyof Customer;
        next[shippingField] = value as any;
      }

      return next;
    });
  };

  const handleSameAsBillingToggle = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shipping_address: prev.billing_address,
        shipping_city: prev.billing_city,
        shipping_state: prev.billing_state,
        shipping_state_code: prev.billing_state_code,
        shipping_pincode: prev.billing_pincode,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.company_name?.trim()) {
      setError('Company Name is required.');
      return;
    }
    if (!formData.phone?.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (formData.gstin && !isValidGSTIN(formData.gstin)) {
      setError('Invalid GSTIN format (e.g. 27ABCDE1234F1Z9).');
      return;
    }
    if (formData.pan && !isValidPAN(formData.pan)) {
      setError('Invalid PAN format (e.g. ABCDE1234F).');
      return;
    }

    setSubmitting(true);
    try {
      await DataStore.saveCustomer({
        ...(formData as any),
        id: editingCustomer?.id,
        company_name: formData.company_name!.trim(),
        gstin: formData.gstin?.trim().toUpperCase(),
        pan: formData.pan?.trim().toUpperCase(),
      });
      setModalOpen(false);
      await loadCustomers(search);
    } catch (err: any) {
      setError(err.message || 'Failed to save customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to archive customer "${name}"?`)) {
      await DataStore.archiveCustomer(id);
      await loadCustomers(search);
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-12">
      <Header
        title="Customer Management"
        subtitle="Manage B2B buyers catalog and billing information"
        actions={
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, GSTIN, or phone..."
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Customer Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5">GSTIN / PAN</th>
                  <th className="px-6 py-3.5">Contact Person</th>
                  <th className="px-6 py-3.5">Phone / Email</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading customers database...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No customers found. Click &quot;Add Customer&quot; to register a new buyer.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <Link href={`/customers/${c.id}`} className="font-bold text-blue-600 hover:underline">
                          {c.company_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono font-semibold text-slate-900">{c.gstin || 'UNREGISTERED'}</div>
                        {c.pan && <div className="text-[10px] text-slate-400">PAN: {c.pan}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {c.contact_person || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{c.phone}</div>
                        {c.email && <div className="text-[10px] text-slate-400">{c.email}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">{c.billing_city || '—'}</div>
                        <div className="text-[10px] text-slate-500">{c.billing_state || '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/customers/${c.id}`}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                            title="View Customer Details & Invoices"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(c)}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                            title="Edit Customer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(c.id, c.company_name)}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                            title="Archive Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Company Details
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.company_name || ''}
                      onChange={(e) => handleFormChange('company_name', e.target.value)}
                      placeholder="e.g. Darshan Jewel Tools"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">GSTIN</label>
                    <input
                      type="text"
                      value={formData.gstin || ''}
                      onChange={(e) => handleFormChange('gstin', e.target.value.toUpperCase())}
                      placeholder="e.g. 27ABCDE1234F1Z9"
                      maxLength={15}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">PAN</label>
                    <input
                      type="text"
                      value={formData.pan || ''}
                      onChange={(e) => handleFormChange('pan', e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contact_person || ''}
                      onChange={(e) => handleFormChange('contact_person', e.target.value)}
                      placeholder="e.g. Darshan Shah"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="e.g. 9820011223"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Alternate Phone</label>
                    <input
                      type="text"
                      value={formData.alternate_phone || ''}
                      onChange={(e) => handleFormChange('alternate_phone', e.target.value)}
                      placeholder="e.g. 02223456789"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="info@darshanjewel.com"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Billing Address */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Billing Address
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700">Street Address</label>
                    <input
                      type="text"
                      value={formData.billing_address || ''}
                      onChange={(e) => handleFormChange('billing_address', e.target.value)}
                      placeholder="105, Zaveri Bazaar Road, Kalbadevi"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">City</label>
                    <input
                      type="text"
                      value={formData.billing_city || ''}
                      onChange={(e) => handleFormChange('billing_city', e.target.value)}
                      placeholder="Mumbai"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">State & Code</label>
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        type="text"
                        value={formData.billing_state || ''}
                        onChange={(e) => handleFormChange('billing_state', e.target.value)}
                        placeholder="Maharashtra"
                        className="col-span-2 mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={formData.billing_state_code || ''}
                        onChange={(e) => handleFormChange('billing_state_code', e.target.value)}
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
                      value={formData.billing_pincode || ''}
                      onChange={(e) => handleFormChange('billing_pincode', e.target.value)}
                      placeholder="400002"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> Shipping Address
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => handleSameAsBillingToggle(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Shipping address same as billing address</span>
                  </label>
                </div>

                {!sameAsBilling && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700">Street Address</label>
                      <input
                        type="text"
                        value={formData.shipping_address || ''}
                        onChange={(e) => handleFormChange('shipping_address', e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">City</label>
                      <input
                        type="text"
                        value={formData.shipping_city || ''}
                        onChange={(e) => handleFormChange('shipping_city', e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">State & Code</label>
                      <div className="grid grid-cols-3 gap-1">
                        <input
                          type="text"
                          value={formData.shipping_state || ''}
                          onChange={(e) => handleFormChange('shipping_state', e.target.value)}
                          className="col-span-2 mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={formData.shipping_state_code || ''}
                          onChange={(e) => handleFormChange('shipping_state_code', e.target.value)}
                          maxLength={2}
                          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-mono text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Pincode</label>
                      <input
                        type="text"
                        value={formData.shipping_pincode || ''}
                        onChange={(e) => handleFormChange('shipping_pincode', e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving Customer...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
