'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { Customer, Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
  FileText,
  Search,
  Plus,
  Printer,
  Eye,
  Copy,
  Ban,
  Filter,
  Calendar,
} from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invList, cList] = await Promise.all([
        DataStore.getInvoices({
          search,
          status: statusFilter,
          customer_id: customerFilter,
          fromDate,
          toDate,
        }),
        DataStore.getCustomers(),
      ]);
      setInvoices(invList);
      setCustomers(cList);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, customerFilter, fromDate, toDate]);

  const handleCancelInvoice = async (id: string, num: string) => {
    if (confirm(`Are you sure you want to cancel Invoice #${num}?`)) {
      await DataStore.updateInvoiceStatus(id, 'cancelled');
      await loadData();
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-12">
      <Header
        title="Invoices Management"
        subtitle="Manage B2B GST invoices, print layouts, and status tracking"
        actions={
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filters & Search Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice no., customer, or GSTIN..."
                className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="issued">Issued</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block w-1/2 rounded-lg border border-slate-200 bg-white py-1.5 px-2 text-[11px] text-slate-700 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block w-1/2 rounded-lg border border-slate-200 bg-white py-1.5 px-2 text-[11px] text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Invoice No.</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5 font-mono">GSTIN</th>
                  <th className="px-6 py-3.5 text-right">Taxable Amt</th>
                  <th className="px-6 py-3.5 text-right">GST Amt</th>
                  <th className="px-6 py-3.5 text-right">Grand Total</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      No invoices found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const gstAmount = (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-bold text-blue-600">
                          <Link href={`/invoices/${inv.id}`} className="hover:underline">
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(inv.invoice_date)}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{inv.customer_name}</td>
                        <td className="px-6 py-4 font-mono text-[11px] font-medium text-slate-600">
                          {inv.customer_gstin || 'UNREGISTERED'}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-800">
                          {formatCurrency(inv.taxable_amount)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-800">
                          {formatCurrency(gstAmount)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {formatCurrency(inv.grand_total)}
                        </td>
                        <td className="px-6 py-4 text-center">
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/invoices/${inv.id}?print=true`}
                              className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                              title="Print Invoice"
                            >
                              <Printer className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/invoices/create?duplicate_id=${inv.id}`}
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                              title="Duplicate Invoice (Use as Template)"
                            >
                              <Copy className="h-4 w-4" />
                            </Link>
                            {inv.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancelInvoice(inv.id, inv.invoice_number)}
                                className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Cancel Invoice"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
