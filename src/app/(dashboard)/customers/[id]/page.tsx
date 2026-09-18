'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { Customer, Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Plus,
  Printer,
  Eye,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const [c, invList] = await Promise.all([
          DataStore.getCustomerById(id),
          DataStore.getInvoices({ customer_id: id }),
        ]);
        setCustomer(c);
        setInvoices(invList);
      } catch (err) {
        console.error('Error loading customer details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Customer not found.</p>
        <Link href="/customers" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
          Back to Customers List
        </Link>
      </div>
    );
  }

  const totalSales = invoices.reduce((acc, inv) => acc + (inv.grand_total || 0), 0);
  const lastInvoiceDate = invoices.length > 0 ? invoices[0].invoice_date : null;

  return (
    <div className="flex-1 space-y-6 pb-12">
      <Header
        title={customer.company_name}
        subtitle="Customer Profile & Invoice History"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/customers')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <Link
              href={`/invoices/create?customer_id=${customer.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice for Customer</span>
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Customer Profile & Stats Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info Card */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{customer.company_name}</h2>
                {customer.contact_person && (
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Contact: {customer.contact_person}</p>
                )}
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 font-mono">
                GSTIN: {customer.gstin || 'UNREGISTERED'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PAN Number</span>
                <p className="text-sm font-mono font-semibold text-slate-800">{customer.pan || '—'}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {customer.phone}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <p className="text-sm text-slate-800 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {customer.email || '—'}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alternate Phone</span>
                <p className="text-sm text-slate-800">{customer.alternate_phone || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" /> Billing Address
                </span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {customer.billing_address || '—'}<br />
                  {customer.billing_city && `${customer.billing_city}, `}
                  {customer.billing_state} {customer.billing_pincode && `- ${customer.billing_pincode}`}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Shipping Address
                </span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {customer.shipping_address || '—'}<br />
                  {customer.shipping_city && `${customer.shipping_city}, `}
                  {customer.shipping_state} {customer.shipping_pincode && `- ${customer.shipping_pincode}`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Invoices</span>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{invoices.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Invoices issued to customer</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Business / Sales</span>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Cumulative sales amount</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Last Invoice Date</span>
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {lastInvoiceDate ? formatDate(lastInvoiceDate) : 'No Invoices Yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Invoice History Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-bold text-slate-900">Customer Invoice History</h3>
            <p className="text-xs text-slate-500">Historical billing records for {customer.company_name}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Invoice No.</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Taxable Amount</th>
                  <th className="px-6 py-3.5 text-right">GST Amount</th>
                  <th className="px-6 py-3.5 text-right">Grand Total</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No billing history found for this customer.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-3.5 font-bold text-blue-600">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{formatDate(inv.invoice_date)}</td>
                      <td className="px-6 py-3.5 text-right font-medium text-slate-800">
                        {formatCurrency(inv.taxable_amount)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium text-slate-800">
                        {formatCurrency((inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0))}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(inv.grand_total)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                            inv.status === 'issued'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : inv.status === 'draft'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/invoices/${inv.id}?print=true`}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Print Invoice"
                          >
                            <Printer className="h-4 w-4" />
                          </Link>
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
    </div>
  );
}
