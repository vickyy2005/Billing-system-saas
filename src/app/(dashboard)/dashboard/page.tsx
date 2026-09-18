'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { Customer, Invoice, Product } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
  Users,
  Package,
  FileText,
  TrendingUp,
  Receipt,
  Plus,
  ArrowRight,
  Printer,
  Eye,
  Building2,
} from 'lucide-react';

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cList, pList, iList] = await Promise.all([
          DataStore.getCustomers(),
          DataStore.getProducts(),
          DataStore.getInvoices(),
        ]);
        setCustomers(cList);
        setProducts(pList);
        setInvoices(iList);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate monthly stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthInvoices = invoices.filter(inv => {
    const d = new Date(inv.invoice_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && inv.status !== 'cancelled';
  });

  const thisMonthSales = thisMonthInvoices.reduce((acc, inv) => acc + (inv.grand_total || 0), 0);
  const thisMonthGST = thisMonthInvoices.reduce(
    (acc, inv) => acc + (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0),
    0
  );

  return (
    <div className="flex-1 space-y-6 pb-12">
      <Header title="Dashboard" subtitle="Overview of your business sales, customers, and GST billing" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
            <p className="text-xs text-slate-500">Create invoices or manage masters in one click</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/invoices/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </Link>
            <Link
              href="/customers?add=true"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>Add Customer</span>
            </Link>
            <Link
              href="/products?add=true"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              <Package className="h-4 w-4 text-slate-500" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1: Total Customers */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Customers</span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{loading ? '...' : customers.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Active B2B buyers catalog</p>
          </div>

          {/* Card 2: Total Products */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Products</span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{loading ? '...' : products.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Master inventory items</p>
          </div>

          {/* Card 3: Total Invoices */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Invoices</span>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{loading ? '...' : invoices.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Generated tax invoices</p>
          </div>

          {/* Card 4: This Month Sales */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">This Month Sales</span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900">{loading ? '...' : formatCurrency(thisMonthSales)}</p>
            <p className="mt-1 text-[11px] text-slate-500">{thisMonthInvoices.length} invoices issued</p>
          </div>

          {/* Card 5: This Month GST */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">This Month GST</span>
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900">{loading ? '...' : formatCurrency(thisMonthGST)}</p>
            <p className="mt-1 text-[11px] text-slate-500">CGST + SGST + IGST</p>
          </div>
        </div>

        {/* Recent Invoices Section */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
              <p className="text-xs text-slate-500">Latest generated B2B GST tax invoices</p>
            </div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Invoice No.</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Grand Total</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading recent invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No invoices found. Click &quot;Create Invoice&quot; to generate your first invoice.
                    </td>
                  </tr>
                ) : (
                  invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-3.5 font-bold text-blue-600">{inv.invoice_number}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900">{inv.customer_name}</div>
                        <div className="text-[10px] text-slate-400">{inv.customer_gstin || 'NO GSTIN'}</div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{formatDate(inv.invoice_date)}</td>
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
