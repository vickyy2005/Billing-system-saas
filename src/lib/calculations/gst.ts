import { GSTSummaryGroup, InvoiceItem } from '@/types';

export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function isIntraStateTransaction(
  sellerStateCode?: string,
  sellerStateName?: string,
  customerStateCode?: string,
  customerStateName?: string
): boolean {
  if (sellerStateCode && customerStateCode) {
    return sellerStateCode.trim() === customerStateCode.trim();
  }
  
  if (sellerStateName && customerStateName) {
    return sellerStateName.trim().toLowerCase() === customerStateName.trim().toLowerCase();
  }

  // Default to intra-state if unassigned
  return true;
}

export interface ItemCalculationParams {
  quantity: number;
  rate: number;
  discount_percent?: number;
  gst_rate: number;
  is_intra_state: boolean;
}

export function calculateInvoiceItem(params: ItemCalculationParams): Omit<InvoiceItem, 'product_name' | 'unit'> {
  const quantity = Math.max(0, params.quantity || 0);
  const rate = Math.max(0, params.rate || 0);
  const discountPercent = Math.max(0, Math.min(100, params.discount_percent || 0));
  const gstRate = Math.max(0, params.gst_rate || 0);

  const grossAmount = roundToTwoDecimals(quantity * rate);
  const discountAmount = roundToTwoDecimals(grossAmount * (discountPercent / 100));
  const taxableAmount = roundToTwoDecimals(grossAmount - discountAmount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (params.is_intra_state) {
    const halfRate = gstRate / 2;
    cgstAmount = roundToTwoDecimals(taxableAmount * (halfRate / 100));
    sgstAmount = roundToTwoDecimals(taxableAmount * (halfRate / 100));
  } else {
    igstAmount = roundToTwoDecimals(taxableAmount * (gstRate / 100));
  }

  const gstAmount = roundToTwoDecimals(cgstAmount + sgstAmount + igstAmount);
  const totalAmount = roundToTwoDecimals(taxableAmount + gstAmount);

  return {
    quantity,
    rate,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    taxable_amount: taxableAmount,
    gst_rate: gstRate,
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    igst_amount: igstAmount,
    gst_amount: gstAmount,
    total_amount: totalAmount,
  };
}

export interface InvoiceTotals {
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  unrounded_total: number;
  round_off: number;
  grand_total: number;
  gst_summary: GSTSummaryGroup[];
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  is_intra_state: boolean
): InvoiceTotals {
  let subtotal = 0;
  let discountAmount = 0;
  let taxableAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  const summaryMap = new Map<number, GSTSummaryGroup>();

  for (const item of items) {
    const gross = roundToTwoDecimals((item.quantity || 0) * (item.rate || 0));
    subtotal += gross;
    discountAmount += item.discount_amount || 0;
    taxableAmount += item.taxable_amount || 0;
    cgstAmount += item.cgst_amount || 0;
    sgstAmount += item.sgst_amount || 0;
    igstAmount += item.igst_amount || 0;

    // Grouping for GST summary
    const rate = item.gst_rate || 0;
    const existing = summaryMap.get(rate) || {
      gst_rate: rate,
      taxable_amount: 0,
      cgst_rate: is_intra_state ? rate / 2 : 0,
      cgst_amount: 0,
      sgst_rate: is_intra_state ? rate / 2 : 0,
      sgst_amount: 0,
      igst_rate: !is_intra_state ? rate : 0,
      igst_amount: 0,
      total_tax_amount: 0,
    };

    existing.taxable_amount = roundToTwoDecimals(existing.taxable_amount + (item.taxable_amount || 0));
    existing.cgst_amount = roundToTwoDecimals(existing.cgst_amount + (item.cgst_amount || 0));
    existing.sgst_amount = roundToTwoDecimals(existing.sgst_amount + (item.sgst_amount || 0));
    existing.igst_amount = roundToTwoDecimals(existing.igst_amount + (item.igst_amount || 0));
    existing.total_tax_amount = roundToTwoDecimals(
      existing.cgst_amount + existing.sgst_amount + existing.igst_amount
    );

    summaryMap.set(rate, existing);
  }

  subtotal = roundToTwoDecimals(subtotal);
  discountAmount = roundToTwoDecimals(discountAmount);
  taxableAmount = roundToTwoDecimals(taxableAmount);
  cgstAmount = roundToTwoDecimals(cgstAmount);
  sgstAmount = roundToTwoDecimals(sgstAmount);
  igstAmount = roundToTwoDecimals(igstAmount);

  const totalGst = roundToTwoDecimals(cgstAmount + sgstAmount + igstAmount);
  const unroundedTotal = roundToTwoDecimals(taxableAmount + totalGst);
  const grandTotal = Math.round(unroundedTotal);
  const roundOff = roundToTwoDecimals(grandTotal - unroundedTotal);

  const gstSummary = Array.from(summaryMap.values()).sort((a, b) => b.gst_rate - a.gst_rate);

  return {
    subtotal,
    discount_amount: discountAmount,
    taxable_amount: taxableAmount,
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    igst_amount: igstAmount,
    unrounded_total: unroundedTotal,
    round_off: roundOff,
    grand_total: grandTotal,
    gst_summary: gstSummary,
  };
}
