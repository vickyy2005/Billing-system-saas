'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { CompanySettings, Invoice } from '@/types';
import { PrintableInvoice } from '@/components/invoices/PrintableInvoice';
import {
  Printer,
  Copy,
  ArrowLeft,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const shouldAutoPrint = searchParams.get('print') === 'true';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const [inv, comp] = await Promise.all([
          DataStore.getInvoiceById(id),
          DataStore.getCompanySettings(),
        ]);
        setInvoice(inv);
        setCompany(comp);

        if (shouldAutoPrint && inv) {
          setTimeout(() => {
            window.print();
          }, 400);
        }
      } catch (err) {
        console.error('Error loading invoice detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, shouldAutoPrint]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!invoice || !company) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Invoice not found.</p>
        <Link href="/invoices" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
          Back to Invoices List
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      {/* Screen Header Controls (Hidden during printing via CSS) */}
      <Header
        title={`Invoice ${invoice.invoice_number}`}
        subtitle={`Issued on ${invoice.invoice_date} to ${invoice.customer_name}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/invoices')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <Link
              href={`/invoices/create?duplicate_id=${invoice.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Copy className="h-4 w-4 text-amber-600" />
              <span>Duplicate</span>
            </Link>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Printable Invoice Component */}
        <div className="rounded-xl bg-white shadow-lg p-2 sm:p-6 border border-slate-200">
          <PrintableInvoice invoice={invoice} company={company} />
        </div>
      </div>
    </div>
  );
}
