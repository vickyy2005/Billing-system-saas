'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { Customer, Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Users,
  Receipt,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [reportType, setReportType] = useState<'sales' | 'customer' | 'monthly' | 'gst'>('sales');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedGstRate, setSelectedGstRate] = useState<number | 'all'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [invList, cList] = await Promise.all([
          DataStore.getInvoices({
            customer_id: selectedCustomerId || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          }),
          DataStore.getCustomers(),
        ]);
        setInvoices(invList);
        setCustomers(cList);
      } catch (err) {
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fromDate, toDate, selectedCustomerId]);

  // Aggregate stats
  const totalTaxable = invoices.reduce((acc, inv) => acc + (inv.taxable_amount || 0), 0);
  const totalCGST = invoices.reduce((acc, inv) => acc + (inv.cgst_amount || 0), 0);
  const totalSGST = invoices.reduce((acc, inv) => acc + (inv.sgst_amount || 0), 0);
  const totalIGST = invoices.reduce((acc, inv) => acc + (inv.igst_amount || 0), 0);
  const totalGST = totalCGST + totalSGST + totalIGST;
  const totalSales = invoices.reduce((acc, inv) => acc + (inv.grand_total || 0), 0);

  // Group by customer for Customer-wise Sales
  const customerMap = new Map<string, { name: string; count: number; total: number; gst: number }>();
  for (const inv of invoices) {
    const key = inv.customer_name || 'Unknown';
    const existing = customerMap.get(key) || { name: key, count: 0, total: 0, gst: 0 };
    existing.count += 1;
    existing.total += inv.grand_total || 0;
    existing.gst += (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0);
    customerMap.set(key, existing);
  }
  const customerReportData = Array.from(customerMap.values()).sort((a, b) => b.total - a.total);

  // Group by month for Monthly Sales
  const monthMap = new Map<string, { month: string; count: number; taxable: number; gst: number; total: number }>();
  for (const inv of invoices) {
    const date = new Date(inv.invoice_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
    const existing = monthMap.get(key) || { month: label, count: 0, taxable: 0, gst: 0, total: 0 };
    existing.count += 1;
    existing.taxable += inv.taxable_amount || 0;
    existing.gst += (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0);
    existing.total += inv.grand_total || 0;
    monthMap.set(key, existing);
  }
  const monthlyReportData = Array.from(monthMap.values()).sort((a, b) => b.month.localeCompare(a.month));

  // CSV Export Utility
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'sales') {
      headers = ['Invoice No', 'Date', 'Customer Name', 'GSTIN', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Grand Total', 'Status'];
      rows = invoices.map(i => [
        i.invoice_number,
        i.invoice_date,
        `"${i.customer_name}"`,
        i.customer_gstin || '',
        (i.taxable_amount || 0).toFixed(2),
        (i.cgst_amount || 0).toFixed(2),
        (i.sgst_amount || 0).toFixed(2),
        (i.igst_amount || 0).toFixed(2),
        (i.grand_total || 0).toFixed(2),
        i.status,
      ]);
    } else if (reportType === 'customer') {
      headers = ['Customer Name', 'Invoice Count', 'Total GST', 'Total Sales'];
      rows = customerReportData.map(c => [
        `"${c.name}"`,
        c.count.toString(),
        c.gst.toFixed(2),
        c.total.toFixed(2),
      ]);
    } else if (reportType === 'monthly') {
      headers = ['Month', 'Invoices', 'Taxable Amount', 'GST Amount', 'Grand Total'];
      rows = monthlyReportData.map(m => [
        `"${m.month}"`,
        m.count.toString(),
        m.taxable.toFixed(2),
        m.gst.toFixed(2),
        m.total.toFixed(2),
      ]);
    } else if (reportType === 'gst') {
      headers = ['Invoice No', 'Date', 'Customer GSTIN', 'Place of Supply', 'Taxable Amount', 'CGST Amount', 'SGST Amount', 'IGST Amount', 'Total Tax'];
      rows = invoices.map(i => [
        i.invoice_number,
        i.invoice_date,
        i.customer_gstin || 'UNREGISTERED',
        i.place_of_supply || 'Maharashtra',
        (i.taxable_amount || 0).toFixed(2),
        (i.cgst_amount || 0).toFixed(2),
        (i.sgst_amount || 0).toFixed(2),
        (i.igst_amount || 0).toFixed(2),
        ((i.cgst_amount || 0) + (i.sgst_amount || 0) + (i.igst_amount || 0)).toFixed(2),
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 space-y-6 pb-12">
      <Header
        title="Business Reports & GST Analytics"
        subtitle="Generate sales reports, GST summaries, and export data for accounting"
        actions={
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Report Type Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: 'sales', label: 'Sales Report', icon: TrendingUp },
            { id: 'customer', label: 'Customer-wise Sales', icon: Users },
            { id: 'monthly', label: 'Monthly Breakdown', icon: Calendar },
            { id: 'gst', label: 'GST Summary', icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = reportType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition ${
                  isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setSelectedCustomerId('');
                }}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate Metrics Bar */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Taxable Turnover</span>
            <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(totalTaxable)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">CGST + SGST Collected</span>
            <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(totalCGST + totalSGST)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">IGST Collected</span>
            <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(totalIGST)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Total Sales (Inc. Taxes)</span>
            <p className="mt-2 text-xl font-bold text-blue-700">{formatCurrency(totalSales)}</p>
          </div>
        </div>

        {/* Dynamic Report Table View */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {reportType === 'sales' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Invoice No</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5 text-right">Taxable</th>
                    <th className="px-6 py-3.5 text-right">CGST</th>
                    <th className="px-6 py-3.5 text-right">SGST</th>
                    <th className="px-6 py-3.5 text-right">IGST</th>
                    <th className="px-6 py-3.5 text-right">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {invoices.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-blue-600">{i.invoice_number}</td>
                      <td className="px-6 py-3.5">{formatDate(i.invoice_date)}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{i.customer_name}</td>
                      <td className="px-6 py-3.5 text-right font-medium">{formatCurrency(i.taxable_amount)}</td>
                      <td className="px-6 py-3.5 text-right text-slate-600">{formatCurrency(i.cgst_amount)}</td>
                      <td className="px-6 py-3.5 text-right text-slate-600">{formatCurrency(i.sgst_amount)}</td>
                      <td className="px-6 py-3.5 text-right text-slate-600">{formatCurrency(i.igst_amount)}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-900">{formatCurrency(i.grand_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'customer' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Customer Name</th>
                    <th className="px-6 py-3.5 text-center">Invoices Count</th>
                    <th className="px-6 py-3.5 text-right">Total GST Collected</th>
                    <th className="px-6 py-3.5 text-right">Total Business Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {customerReportData.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{c.name}</td>
                      <td className="px-6 py-3.5 text-center font-semibold">{c.count}</td>
                      <td className="px-6 py-3.5 text-right font-medium text-purple-700">{formatCurrency(c.gst)}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-blue-700">{formatCurrency(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'monthly' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Month</th>
                    <th className="px-6 py-3.5 text-center">Invoices Issued</th>
                    <th className="px-6 py-3.5 text-right">Taxable Amount</th>
                    <th className="px-6 py-3.5 text-right">Total GST</th>
                    <th className="px-6 py-3.5 text-right">Grand Total Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {monthlyReportData.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{m.month}</td>
                      <td className="px-6 py-3.5 text-center font-semibold">{m.count}</td>
                      <td className="px-6 py-3.5 text-right font-medium">{formatCurrency(m.taxable)}</td>
                      <td className="px-6 py-3.5 text-right font-medium text-purple-700">{formatCurrency(m.gst)}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-blue-700">{formatCurrency(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'gst' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Invoice No</th>
                    <th className="px-6 py-3.5">Customer GSTIN</th>
                    <th className="px-6 py-3.5">Place of Supply</th>
                    <th className="px-6 py-3.5 text-right">Taxable Value</th>
                    <th className="px-6 py-3.5 text-right">CGST</th>
                    <th className="px-6 py-3.5 text-right">SGST</th>
                    <th className="px-6 py-3.5 text-right">IGST</th>
                    <th className="px-6 py-3.5 text-right">Total GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {invoices.map((i) => {
                    const gstTotal = (i.cgst_amount || 0) + (i.sgst_amount || 0) + (i.igst_amount || 0);
                    return (
                      <tr key={i.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-bold text-blue-600">{i.invoice_number}</td>
                        <td className="px-6 py-3.5 font-mono font-semibold">{i.customer_gstin || 'UNREGISTERED'}</td>
                        <td className="px-6 py-3.5">{i.place_of_supply || 'Maharashtra'}</td>
                        <td className="px-6 py-3.5 text-right font-medium">{formatCurrency(i.taxable_amount)}</td>
                        <td className="px-6 py-3.5 text-right">{formatCurrency(i.cgst_amount)}</td>
                        <td className="px-6 py-3.5 text-right">{formatCurrency(i.sgst_amount)}</td>
                        <td className="px-6 py-3.5 text-right">{formatCurrency(i.igst_amount)}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-purple-700">{formatCurrency(gstTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
