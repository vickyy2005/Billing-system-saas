'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const shouldOpenAdd = searchParams.get('add') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    description: '',
    hsn_code: '7305',
    unit: 'PCS',
    default_rate: 0,
    gst_rate: 18,
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (shouldOpenAdd) {
      openAddModal();
    }
  }, [shouldOpenAdd]);

  const loadProducts = async (query = '') => {
    setLoading(true);
    try {
      const data = await DataStore.getProducts(query);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      description: '',
      hsn_code: '7305',
      unit: 'PCS',
      default_rate: 0,
      gst_rate: 18,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.product_name?.trim()) {
      setError('Product Name is required.');
      return;
    }
    if ((formData.default_rate ?? 0) < 0) {
      setError('Default rate cannot be negative.');
      return;
    }
    if ((formData.gst_rate ?? 0) < 0) {
      setError('GST rate cannot be negative.');
      return;
    }

    setSubmitting(true);
    try {
      await DataStore.saveProduct({
        ...(formData as any),
        id: editingProduct?.id,
        product_name: formData.product_name!.trim(),
        unit: formData.unit || 'PCS',
        default_rate: Number(formData.default_rate || 0),
        gst_rate: Number(formData.gst_rate || 0),
      });
      setModalOpen(false);
      await loadProducts(search);
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to archive product "${name}"?`)) {
      await DataStore.archiveProduct(id);
      await loadProducts(search);
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-12">
      <Header
        title="Product Master Catalog"
        subtitle="Manage product items, HSN/SAC codes, rates, and GST percentages"
        actions={
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
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
            placeholder="Search products by name or HSN code..."
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Product Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">HSN / SAC</th>
                  <th className="px-6 py-3.5">Unit</th>
                  <th className="px-6 py-3.5 text-right">Default Rate</th>
                  <th className="px-6 py-3.5 text-center">GST %</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading products database...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No products found. Click &quot;Add Product&quot; to create your first item.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.product_name}</div>
                        {p.description && <div className="text-[11px] text-slate-400 mt-0.5">{p.description}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">{p.hsn_code || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {p.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(p.default_rate)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                          {p.gst_rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(p.id, p.product_name)}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                            title="Archive Product"
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.product_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="e.g. S S FLASK 304 4 X 9"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Stainless Steel Flask 304 Grade 4x9 inches"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={formData.hsn_code || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, hsn_code: e.target.value }))}
                    placeholder="e.g. 7305"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Measurement Unit *</label>
                  <select
                    value={formData.unit || 'PCS'}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="KGS">KGS (Kilograms)</option>
                    <option value="MTR">MTR (Meters)</option>
                    <option value="SET">SET (Sets)</option>
                    <option value="BOX">BOX (Boxes)</option>
                    <option value="LOT">LOT (Lot / Freight)</option>
                    <option value="NOS">NOS (Numbers)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Default Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.default_rate ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="840.00"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">GST Rate (%)</label>
                  <select
                    value={formData.gst_rate ?? 18}
                    onChange={(e) => setFormData(prev => ({ ...prev, gst_rate: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

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
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
