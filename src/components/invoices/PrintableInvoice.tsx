'use client';

import React from 'react';
import { CompanySettings, Invoice, InvoiceItem } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/formatters';
import { calculateInvoiceTotals, isIntraStateTransaction } from '@/lib/calculations/gst';
import { convertAmountToWords } from '@/lib/utils/indian-currency-words';

interface PrintableInvoiceProps {
  invoice: Invoice;
  company: CompanySettings;
}

export function PrintableInvoice({ invoice, company }: PrintableInvoiceProps) {
  const isIntraState = isIntraStateTransaction(
    company.state_code,
    company.state,
    invoice.place_of_supply_state_code || invoice.billing_state_code,
    invoice.place_of_supply || invoice.billing_state
  );

  const items = invoice.items || [];
  const totals = calculateInvoiceTotals(items, isIntraState);
  const amountWords = convertAmountToWords(invoice.grand_total || totals.grand_total);

  return (
    <div className="printable-invoice bg-white text-slate-900 font-sans p-6 max-w-[210mm] mx-auto border border-slate-300 print:border-none print:p-0">
      {/* HEADER SECTION */}
      <div className="border border-slate-800">
        <div className="bg-slate-900 text-white text-center py-1.5 px-4 font-bold text-sm tracking-wider uppercase border-b border-slate-800">
          TAX INVOICE
        </div>

        {/* SELLER & INVOICE META GRID */}
        <div className="grid grid-cols-12 divide-x divide-slate-800 text-xs">
          {/* SELLER INFO (Left 7 Cols) */}
          <div className="col-span-7 p-3 space-y-1">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
              {company.company_name}
            </h1>
            <p className="text-[11px] leading-snug font-medium text-slate-700">
              {company.address}, {company.city}, {company.state} - {company.pincode}
            </p>
            <div className="flex flex-wrap gap-x-4 text-[11px] font-semibold text-slate-800 pt-1">
              <span>GSTIN: <strong className="font-mono">{company.gstin}</strong></span>
              <span>PAN: <strong className="font-mono">{company.pan}</strong></span>
            </div>
            <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-600">
              <span>Ph: {company.phone}</span>
              <span>Email: {company.email}</span>
            </div>
          </div>

          {/* INVOICE DETAILS (Right 5 Cols) */}
          <div className="col-span-5 p-2.5 space-y-1 font-medium text-[11px] bg-slate-50/50">
            <div className="grid grid-cols-2 gap-1 border-b border-slate-200 pb-1">
              <span className="text-slate-500">Invoice No:</span>
              <span className="font-bold font-mono text-blue-900 text-xs">{invoice.invoice_number}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 border-b border-slate-200 pb-1">
              <span className="text-slate-500">Invoice Date:</span>
              <span className="font-semibold">{formatDate(invoice.invoice_date)}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-slate-500">Place of Supply:</span>
              <span className="font-semibold">
                {invoice.place_of_supply || invoice.billing_state} ({invoice.place_of_supply_state_code || invoice.billing_state_code || '27'})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <span className="text-slate-500">Reverse Charge:</span>
              <span className="font-bold">{invoice.reverse_charge ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>

        {/* LOGISTICS & TRANSPORT BAR */}
        <div className="grid grid-cols-5 border-t border-slate-800 text-[10px] text-center divide-x divide-slate-800 bg-slate-100/70 font-medium py-1">
          <div><span className="text-slate-500">Po/Order No:</span> {invoice.order_number || '—'}</div>
          <div><span className="text-slate-500">Challan No:</span> {invoice.challan_number || '—'}</div>
          <div><span className="text-slate-500">L.R./R.R. No:</span> {invoice.lr_rr_number || '—'}</div>
          <div><span className="text-slate-500">Vehicle No:</span> {invoice.vehicle_number || '—'}</div>
          <div><span className="text-slate-500">Transport:</span> {invoice.transport || '—'}</div>
        </div>

        {/* BILL TO & SHIPPED TO (TWO COLUMNS) */}
        <div className="grid grid-cols-2 border-t border-slate-800 divide-x divide-slate-800 text-xs">
          {/* BILLED TO */}
          <div className="p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mb-1">
              BILLED TO (BUYER)
            </span>
            <h2 className="font-bold text-slate-900 text-sm">{invoice.customer_name}</h2>
            <p className="text-[11px] leading-relaxed text-slate-700">
              {invoice.billing_address}<br />
              {invoice.billing_city && `${invoice.billing_city}, `}
              {invoice.billing_state} {invoice.billing_pincode && `- ${invoice.billing_pincode}`}
            </p>
            <div className="pt-1 text-[11px] space-x-3">
              <span>GSTIN: <strong className="font-mono font-bold text-slate-900">{invoice.customer_gstin || 'UNREGISTERED'}</strong></span>
              {invoice.customer_pan && <span>PAN: <strong className="font-mono">{invoice.customer_pan}</strong></span>}
            </div>
            {invoice.customer_phone && <p className="text-[10px] text-slate-600">Ph: {invoice.customer_phone}</p>}
          </div>

          {/* SHIPPED TO */}
          <div className="p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mb-1">
              SHIPPED TO (CONSIGNEE)
            </span>
            <h2 className="font-bold text-slate-900 text-sm">{invoice.customer_name}</h2>
            <p className="text-[11px] leading-relaxed text-slate-700">
              {invoice.shipping_address || invoice.billing_address}<br />
              {(invoice.shipping_city || invoice.billing_city) && `${invoice.shipping_city || invoice.billing_city}, `}
              {invoice.shipping_state || invoice.billing_state} {(invoice.shipping_pincode || invoice.billing_pincode) && `- ${invoice.shipping_pincode || invoice.billing_pincode}`}
            </p>
            <div className="pt-1 text-[11px]">
              <span>State Code: <strong className="font-mono">{invoice.shipping_state_code || invoice.billing_state_code || '27'}</strong></span>
            </div>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="border-t border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-1.5 text-center border-r border-slate-800 w-8">Sr.</th>
                <th className="p-1.5 border-r border-slate-800">Item Description</th>
                <th className="p-1.5 text-center border-r border-slate-800 w-16">HSN/SAC</th>
                <th className="p-1.5 text-right border-r border-slate-800 w-12">Qty</th>
                <th className="p-1.5 text-center border-r border-slate-800 w-10">Unit</th>
                <th className="p-1.5 text-right border-r border-slate-800 w-16">Rate (₹)</th>
                <th className="p-1.5 text-right border-r border-slate-800 w-12">Disc %</th>
                <th className="p-1.5 text-right border-r border-slate-800 w-20">Taxable (₹)</th>
                <th className="p-1.5 text-center border-r border-slate-800 w-12">GST %</th>
                <th className="p-1.5 text-right border-r border-slate-800 w-16">GST (₹)</th>
                <th className="p-1.5 text-right w-20">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-1.5 text-center border-r border-slate-800 font-medium">{idx + 1}</td>
                  <td className="p-1.5 border-r border-slate-800 font-semibold text-slate-900">
                    {item.product_name}
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-800 font-mono">{item.hsn_code || '—'}</td>
                  <td className="p-1.5 text-right border-r border-slate-800 font-bold">{item.quantity}</td>
                  <td className="p-1.5 text-center border-r border-slate-800 text-[10px]">{item.unit}</td>
                  <td className="p-1.5 text-right border-r border-slate-800">{formatNumber(item.rate)}</td>
                  <td className="p-1.5 text-right border-r border-slate-800">{item.discount_percent || 0}%</td>
                  <td className="p-1.5 text-right border-r border-slate-800 font-semibold">{formatNumber(item.taxable_amount)}</td>
                  <td className="p-1.5 text-center border-r border-slate-800 font-medium">{item.gst_rate}%</td>
                  <td className="p-1.5 text-right border-r border-slate-800">{formatNumber(item.gst_amount)}</td>
                  <td className="p-1.5 text-right font-bold text-slate-900">{formatNumber(item.total_amount)}</td>
                </tr>
              ))}
              {/* Fill minimum height rows for print aesthetics */}
              {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td className="border-r border-slate-800">&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MONETARY SUMMARY & GST TAX GROUPING SECTION */}
        <div className="grid grid-cols-12 border-t border-slate-800 divide-x divide-slate-800 text-xs">
          {/* GST TAX RATE SUMMARY (Left 7 Cols) */}
          <div className="col-span-7 p-2 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              GST TAX BREAKDOWN SUMMARY
            </span>
            <table className="w-full text-[10px] border border-slate-400 border-collapse">
              <thead className="bg-slate-200 font-bold text-center">
                <tr>
                  <th className="p-1 border border-slate-400">Rate</th>
                  <th className="p-1 border border-slate-400">Taxable Amt</th>
                  {isIntraState ? (
                    <>
                      <th className="p-1 border border-slate-400">CGST</th>
                      <th className="p-1 border border-slate-400">SGST</th>
                    </>
                  ) : (
                    <th className="p-1 border border-slate-400">IGST</th>
                  )}
                  <th className="p-1 border border-slate-400">Total Tax</th>
                </tr>
              </thead>
              <tbody className="text-right">
                {totals.gst_summary.map((g, i) => (
                  <tr key={i}>
                    <td className="p-1 border border-slate-400 text-center font-bold">{g.gst_rate}%</td>
                    <td className="p-1 border border-slate-400">{formatNumber(g.taxable_amount)}</td>
                    {isIntraState ? (
                      <>
                        <td className="p-1 border border-slate-400">{formatNumber(g.cgst_amount)}</td>
                        <td className="p-1 border border-slate-400">{formatNumber(g.sgst_amount)}</td>
                      </>
                    ) : (
                      <td className="p-1 border border-slate-400">{formatNumber(g.igst_amount)}</td>
                    )}
                    <td className="p-1 border border-slate-400 font-bold">{formatNumber(g.total_tax_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* BANK DETAILS BOX */}
            <div className="border border-slate-300 bg-slate-50 p-2 rounded text-[10px] space-y-0.5 mt-2">
              <p className="font-bold text-slate-800 uppercase tracking-wider">BANK DETAILS FOR PAYMENT:</p>
              <div className="grid grid-cols-2 gap-x-2">
                <span>Bank: <strong>{company.bank_name}</strong></span>
                <span>A/C No: <strong className="font-mono">{company.bank_account_number}</strong></span>
                <span>Branch: <strong>{company.bank_branch}</strong></span>
                <span>IFSC: <strong className="font-mono">{company.bank_ifsc}</strong></span>
              </div>
            </div>
          </div>

          {/* TOTAL CALCULATIONS (Right 5 Cols) */}
          <div className="col-span-5 p-2.5 space-y-1.5 font-medium">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discount_amount > 0 && (
              <div className="flex justify-between border-b border-slate-200 pb-1 text-emerald-700">
                <span>Discount:</span>
                <span>- {formatCurrency(totals.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600">Taxable Amount:</span>
              <span className="font-semibold">{formatCurrency(totals.taxable_amount)}</span>
            </div>
            {isIntraState ? (
              <>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">CGST Amount:</span>
                  <span className="font-semibold">{formatCurrency(totals.cgst_amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-600">SGST Amount:</span>
                  <span className="font-semibold">{formatCurrency(totals.sgst_amount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-600">IGST Amount:</span>
                <span className="font-semibold">{formatCurrency(totals.igst_amount)}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200 pb-1 text-[10px]">
              <span className="text-slate-500">Round Off:</span>
              <span className="font-mono">{totals.round_off >= 0 ? `+${totals.round_off.toFixed(2)}` : totals.round_off.toFixed(2)}</span>
            </div>
            <div className="flex justify-between bg-slate-900 text-white p-2 rounded text-sm font-extrabold mt-2">
              <span>GRAND TOTAL:</span>
              <span>{formatCurrency(invoice.grand_total || totals.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* AMOUNT IN WORDS */}
        <div className="border-t border-slate-800 p-2.5 bg-slate-50 text-xs font-bold text-slate-900">
          Amount in Words: <span className="font-normal italic text-slate-800">{amountWords}</span>
        </div>

        {/* TERMS & SIGNATURE FOOTER */}
        <div className="grid grid-cols-12 border-t border-slate-800 divide-x divide-slate-800 text-[10px]">
          <div className="col-span-8 p-3 space-y-1 text-slate-600">
            <span className="font-bold text-slate-800 uppercase tracking-wider block">Terms & Conditions:</span>
            <p className="whitespace-pre-line leading-tight">{company.terms_and_conditions}</p>
          </div>
          <div className="col-span-4 p-3 flex flex-col justify-between items-center text-center">
            <span className="font-bold text-slate-800">{company.authorized_signatory || `For ${company.company_name}`}</span>
            <div className="h-10"></div>
            <span className="text-slate-500 border-t border-slate-400 w-full pt-1">Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
