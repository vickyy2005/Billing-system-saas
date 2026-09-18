'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DataStore } from '@/lib/supabase/store';
import { CompanySettings, Customer, Invoice, InvoiceItem, Product } from '@/types';
import { CustomerAutocomplete } from '@/components/invoices/CustomerAutocomplete';
import { PrintableInvoice } from '@/components/invoices/PrintableInvoice';
import { calculateInvoiceItem, calculateInvoiceTotals, isIntraStateTransaction } from '@/lib/calculations/gst';
import { convertAmountToWords } from '@/lib/utils/indian-currency-words';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import {
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Eye,
  Printer,
  ArrowLeft,
  AlertCircle,
  Search,
  Package,
} from 'lucide-react';

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get('duplicate_id');
  const preselectCustomerId = searchParams.get('customer_id');

  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Invoice Form Header State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderNumber, setOrderNumber] = useState('');
  const [challanNumber, setChallanNumber] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [transport, setTransport] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
  const [placeOfSupplyStateCode, setPlaceOfSupplyStateCode] = useState('27');
  const [reverseCharge, setReverseCharge] = useState(false);

  // Custom Shipping Address Override
  const [useCustomShipping, setUseCustomShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingStateCode, setShippingStateCode] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');

  // Line Items State
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Product Autocomplete Search State for Line Rows
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductDropdownIndex, setShowProductDropdownIndex] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [comp, pList, nextNum] = await Promise.all([
          DataStore.getCompanySettings(),
          DataStore.getProducts(),
          DataStore.getNextInvoiceNumber(),
        ]);
        setCompany(comp);
        setProductsCatalog(pList);
        setInvoiceNumber(nextNum);

        // Pre-select Customer if passed in URL
        if (preselectCustomerId) {
          const cust = await DataStore.getCustomerById(preselectCustomerId);
          if (cust) handleSelectCustomer(cust);
        }

        // Duplicate Invoice Logic
        if (duplicateId) {
          const orig = await DataStore.getInvoiceById(duplicateId);
          if (orig) {
            setOrderNumber(orig.order_number || '');
            setChallanNumber(orig.challan_number || '');
            setLrNumber(orig.lr_rr_number || '');
            setVehicleNumber(orig.vehicle_number || '');
            setTransport(orig.transport || '');
            setPlaceOfSupply(orig.place_of_supply || 'Maharashtra');
            setPlaceOfSupplyStateCode(orig.place_of_supply_state_code || '27');
            setReverseCharge(orig.reverse_charge || false);

            if (orig.customer_id) {
              const cust = await DataStore.getCustomerById(orig.customer_id);
              if (cust) handleSelectCustomer(cust);
            }

            if (orig.items && orig.items.length > 0) {
              setItems(orig.items.map(item => ({ ...item, id: crypto.randomUUID() })));
            }
          }
        } else if (!items.length) {
          // Add 1 default empty item row
          addEmptyItemRow();
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [duplicateId, preselectCustomerId]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    const posState = customer.billing_state || company?.state || 'Maharashtra';
    const posCode = customer.billing_state_code || company?.state_code || '27';
    setPlaceOfSupply(posState);
    setPlaceOfSupplyStateCode(posCode);

    setShippingAddress(customer.shipping_address || customer.billing_address || '');
    setShippingCity(customer.shipping_city || customer.billing_city || '');
    setShippingState(customer.shipping_state || customer.billing_state || '');
    setShippingStateCode(customer.shipping_state_code || customer.billing_state_code || '');
    setShippingPincode(customer.shipping_pincode || customer.billing_pincode || '');

    recalculateAllItems(posCode, posState);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
  };

  const addEmptyItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        product_name: '',
        hsn_code: '7305',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        discount_percent: 0,
        discount_amount: 0,
        taxable_amount: 0,
        gst_rate: 18,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        gst_amount: 0,
        total_amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const isIntraState = isIntraStateTransaction(
    company?.state_code,
    company?.state,
    placeOfSupplyStateCode,
    placeOfSupply
  );

  const updateItemRow = (index: number, updates: Partial<InvoiceItem>) => {
    setItems((prev) => {
      const next = [...prev];
      const current = { ...next[index], ...updates };

      const calculated = calculateInvoiceItem({
        quantity: current.quantity,
        rate: current.rate,
        discount_percent: current.discount_percent,
        gst_rate: current.gst_rate,
        is_intra_state: isIntraState,
      });

      next[index] = {
        ...current,
        ...calculated,
      };

      return next;
    });
  };

  const recalculateAllItems = (posCode = placeOfSupplyStateCode, posState = placeOfSupply) => {
    const isIntra = isIntraStateTransaction(company?.state_code, company?.state, posCode, posState);
    setItems((prev) =>
      prev.map((item) => {
        const calculated = calculateInvoiceItem({
          quantity: item.quantity,
          rate: item.rate,
          discount_percent: item.discount_percent,
          gst_rate: item.gst_rate,
          is_intra_state: isIntra,
        });
        return { ...item, ...calculated };
      })
    );
  };

  const handleSelectCatalogProduct = (index: number, product: Product) => {
    updateItemRow(index, {
      product_id: product.id,
      product_name: product.product_name,
      hsn_code: product.hsn_code || '',
      unit: product.unit || 'PCS',
      rate: product.default_rate || 0,
      gst_rate: product.gst_rate || 18,
    });
    setShowProductDropdownIndex(null);
  };

  const totals = calculateInvoiceTotals(items, isIntraState);
  const amountWords = convertAmountToWords(totals.grand_total);

  const buildInvoicePayload = (status: 'draft' | 'issued'): Omit<Invoice, 'id'> => {
    if (!selectedCustomer) throw new Error('Please select a customer.');
    if (items.length === 0) throw new Error('Please add at least one line item.');
    if (items.some((item) => !item.product_name.trim())) {
      throw new Error('All line items must have a product name.');
    }

    return {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      customer_id: selectedCustomer.id,

      // Snapshot customer details
      customer_name: selectedCustomer.company_name,
      customer_gstin: selectedCustomer.gstin,
      customer_pan: selectedCustomer.pan,
      customer_phone: selectedCustomer.phone,
      customer_email: selectedCustomer.email,
      billing_address: selectedCustomer.billing_address,
      billing_city: selectedCustomer.billing_city,
      billing_state: selectedCustomer.billing_state,
      billing_state_code: selectedCustomer.billing_state_code,
      billing_pincode: selectedCustomer.billing_pincode,

      shipping_address: useCustomShipping ? shippingAddress : selectedCustomer.shipping_address || selectedCustomer.billing_address,
      shipping_city: useCustomShipping ? shippingCity : selectedCustomer.shipping_city || selectedCustomer.billing_city,
      shipping_state: useCustomShipping ? shippingState : selectedCustomer.shipping_state || selectedCustomer.billing_state,
      shipping_state_code: useCustomShipping ? shippingStateCode : selectedCustomer.shipping_state_code || selectedCustomer.billing_state_code,
      shipping_pincode: useCustomShipping ? shippingPincode : selectedCustomer.shipping_pincode || selectedCustomer.billing_pincode,

      order_number: orderNumber,
      challan_number: challanNumber,
      lr_rr_number: lrNumber,
      vehicle_number: vehicleNumber,
      transport,
      place_of_supply: placeOfSupply,
      place_of_supply_state_code: placeOfSupplyStateCode,
      reverse_charge: reverseCharge,

      subtotal: totals.subtotal,
      discount_amount: totals.discount_amount,
      taxable_amount: totals.taxable_amount,
      cgst_amount: totals.cgst_amount,
      sgst_amount: totals.sgst_amount,
      igst_amount: totals.igst_amount,
      round_off: totals.round_off,
      grand_total: totals.grand_total,
      amount_in_words: amountWords,

      status,
      items,
    };
  };

  const handleSaveInvoice = async (status: 'draft' | 'issued') => {
    setError('');
    try {
      const payload = buildInvoicePayload(status);
      setSaving(true);
      const saved = await DataStore.saveInvoice(payload);
      router.push(`/invoices/${saved.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice.');
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

  // Construct temporary invoice object for Live Preview Mode
  const previewInvoiceData: Invoice = {
    id: 'preview-id',
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    customer_name: selectedCustomer?.company_name || 'Customer Name',
    customer_gstin: selectedCustomer?.gstin,
    customer_pan: selectedCustomer?.pan,
    customer_phone: selectedCustomer?.phone,
    customer_email: selectedCustomer?.email,
    billing_address: selectedCustomer?.billing_address,
    billing_city: selectedCustomer?.billing_city,
    billing_state: selectedCustomer?.billing_state,
    billing_state_code: selectedCustomer?.billing_state_code,
    billing_pincode: selectedCustomer?.billing_pincode,
    shipping_address: useCustomShipping ? shippingAddress : selectedCustomer?.shipping_address || selectedCustomer?.billing_address,
    shipping_city: useCustomShipping ? shippingCity : selectedCustomer?.shipping_city || selectedCustomer?.billing_city,
    shipping_state: useCustomShipping ? shippingState : selectedCustomer?.shipping_state || selectedCustomer?.billing_state,
    shipping_state_code: useCustomShipping ? shippingStateCode : selectedCustomer?.shipping_state_code || selectedCustomer?.billing_state_code,
    shipping_pincode: useCustomShipping ? shippingPincode : selectedCustomer?.shipping_pincode || selectedCustomer?.billing_pincode,
    order_number: orderNumber,
    challan_number: challanNumber,
    lr_rr_number: lrNumber,
    vehicle_number: vehicleNumber,
    transport,
    place_of_supply: placeOfSupply,
    place_of_supply_state_code: placeOfSupplyStateCode,
    reverse_charge: reverseCharge,
    subtotal: totals.subtotal,
    discount_amount: totals.discount_amount,
    taxable_amount: totals.taxable_amount,
    cgst_amount: totals.cgst_amount,
    sgst_amount: totals.sgst_amount,
    igst_amount: totals.igst_amount,
    round_off: totals.round_off,
    grand_total: totals.grand_total,
    amount_in_words: amountWords,
    status: 'draft',
    items,
  };

  return (
    <div className="flex-1 space-y-6 pb-16">
      <Header
        title={duplicateId ? 'Duplicate Invoice' : 'Create New GST Invoice'}
        subtitle="Generate B2B tax invoice with automated customer & product autocomplete"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Eye className="h-4 w-4 text-blue-600" />
              <span>{isPreviewMode ? 'Back to Edit' : 'Live Preview'}</span>
            </button>
            <button
              onClick={() => handleSaveInvoice('draft')}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Save className="h-4 w-4 text-slate-500" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSaveInvoice('issued')}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Issue Invoice</span>
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PREVIEW MODE TOGGLE CONTAINER */}
        {isPreviewMode && company ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200 flex items-center justify-between">
              <span>Viewing live invoice print preview. Click &quot;Back to Edit&quot; to adjust details.</span>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 font-bold text-white shadow"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
            <PrintableInvoice invoice={previewInvoiceData} company={company} />
          </div>
        ) : (
          /* FORM EDIT MODE */
          <div className="space-y-6">
            {/* SECTION 1: INVOICE HEADER DETAILS */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                1. Invoice Details & Logistics
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-blue-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">PO / Order Number</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. PO-8891"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Challan Number</label>
                  <input
                    type="text"
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    placeholder="e.g. CH-402"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">L.R. / R.R. Number</label>
                  <input
                    type="text"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    placeholder="e.g. LR-9921"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. MH-02-CL-4412"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Transport / Courier</label>
                  <input
                    type="text"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                    placeholder="e.g. V-Trans Logistics"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Reverse Charge</label>
                  <select
                    value={reverseCharge ? 'yes' : 'no'}
                    onChange={(e) => setReverseCharge(e.target.value === 'yes')}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: CUSTOMER SELECTION & PLACE OF SUPPLY */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                2. Customer & Billed Information
              </h2>

              <CustomerAutocomplete
                selectedCustomer={selectedCustomer}
                onSelectCustomer={handleSelectCustomer}
                onClearCustomer={handleClearCustomer}
              />

              {selectedCustomer && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  {/* Place of Supply */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Place of Supply (State & Code)</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <input
                        type="text"
                        value={placeOfSupply}
                        onChange={(e) => {
                          setPlaceOfSupply(e.target.value);
                          recalculateAllItems(placeOfSupplyStateCode, e.target.value);
                        }}
                        className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={placeOfSupplyStateCode}
                        onChange={(e) => {
                          setPlaceOfSupplyStateCode(e.target.value);
                          recalculateAllItems(e.target.value, placeOfSupply);
                        }}
                        maxLength={2}
                        className="rounded-lg border border-slate-300 px-2 py-2 text-sm font-mono text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Tax Mode:{' '}
                      <strong className={isIntraState ? 'text-emerald-700' : 'text-purple-700'}>
                        {isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
                      </strong>
                    </p>
                  </div>

                  {/* Consignee Shipping Address Option */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Shipping Address (Consignee)</label>
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useCustomShipping}
                          onChange={(e) => setUseCustomShipping(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                        />
                        <span>Custom Shipping Address</span>
                      </label>
                    </div>

                    {useCustomShipping ? (
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter separate shipping address..."
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-200">
                        Same as Billing Address ({selectedCustomer.billing_city}, {selectedCustomer.billing_state})
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: DYNAMIC INVOICE ITEMS TABLE */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  3. Line Items & Product Table
                </h2>
                <button
                  type="button"
                  onClick={addEmptyItemRow}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-2 w-8 text-center">Sr.</th>
                      <th className="py-2.5 px-2 min-w-[200px]">Product / Item Description *</th>
                      <th className="py-2.5 px-2 w-20">HSN/SAC</th>
                      <th className="py-2.5 px-2 w-20 text-right">Qty *</th>
                      <th className="py-2.5 px-2 w-20 text-center">Unit</th>
                      <th className="py-2.5 px-2 w-24 text-right">Rate (₹) *</th>
                      <th className="py-2.5 px-2 w-16 text-right">Disc %</th>
                      <th className="py-2.5 px-2 w-24 text-right">Taxable (₹)</th>
                      <th className="py-2.5 px-2 w-20 text-center">GST %</th>
                      <th className="py-2.5 px-2 w-24 text-right">GST (₹)</th>
                      <th className="py-2.5 px-2 w-24 text-right">Total (₹)</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-2 text-center font-bold text-slate-500">{idx + 1}</td>

                        {/* Product Name with Catalog Autocomplete */}
                        <td className="py-2.5 px-2 relative">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={item.product_name}
                              onChange={(e) => {
                                updateItemRow(idx, { product_name: e.target.value });
                                setProductSearchQuery(e.target.value);
                                setShowProductDropdownIndex(idx);
                              }}
                              onFocus={() => {
                                setProductSearchQuery(item.product_name);
                                setShowProductDropdownIndex(idx);
                              }}
                              placeholder="Type or select product..."
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Product Autocomplete Dropdown */}
                          {showProductDropdownIndex === idx && (
                            <div className="absolute left-0 top-full z-40 mt-1 max-h-48 w-72 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                Master Catalog Suggestions
                              </div>
                              {productsCatalog
                                .filter((p) =>
                                  !productSearchQuery.trim() ||
                                  p.product_name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                  (p.hsn_code && p.hsn_code.includes(productSearchQuery))
                                )
                                .map((p) => (
                                  <div
                                    key={p.id}
                                    onClick={() => handleSelectCatalogProduct(idx, p)}
                                    className="cursor-pointer px-3 py-1.5 text-xs hover:bg-blue-50 transition border-b border-slate-100 last:border-none"
                                  >
                                    <div className="font-semibold text-slate-900">{p.product_name}</div>
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                      <span>HSN: {p.hsn_code || '—'}</span>
                                      <span>₹{p.default_rate} ({p.gst_rate}%)</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </td>

                        {/* HSN Code */}
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={item.hsn_code || ''}
                            onChange={(e) => updateItemRow(idx, { hsn_code: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono text-center focus:border-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={item.quantity || ''}
                            onChange={(e) => updateItemRow(idx, { quantity: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold text-right focus:border-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* Unit */}
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={item.unit || 'PCS'}
                            onChange={(e) => updateItemRow(idx, { unit: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-1 py-1.5 text-xs text-center uppercase focus:border-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* Rate */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.rate || ''}
                            onChange={(e) => updateItemRow(idx, { rate: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-right focus:border-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* Discount % */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={item.discount_percent || 0}
                            onChange={(e) => updateItemRow(idx, { discount_percent: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-right focus:border-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* Taxable Amount */}
                        <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                          {formatNumber(item.taxable_amount)}
                        </td>

                        {/* GST % */}
                        <td className="py-2.5 px-2">
                          <select
                            value={item.gst_rate || 18}
                            onChange={(e) => updateItemRow(idx, { gst_rate: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-slate-300 px-1 py-1.5 text-xs text-center focus:border-blue-500 focus:outline-none"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>

                        {/* GST Amount */}
                        <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                          {formatNumber(item.gst_amount)}
                        </td>

                        {/* Total Amount */}
                        <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                          {formatNumber(item.total_amount)}
                        </td>

                        {/* Remove Action */}
                        <td className="py-2.5 px-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 4: INVOICE TOTALS & SUMMARY */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* GST Tax Summary Box (Left 7 cols) */}
              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  GST Rate Breakdown Summary
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200">
                    <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                      <tr>
                        <th className="p-2 border border-slate-200 text-center">Rate</th>
                        <th className="p-2 border border-slate-200 text-right">Taxable Amt</th>
                        {isIntraState ? (
                          <>
                            <th className="p-2 border border-slate-200 text-right">CGST</th>
                            <th className="p-2 border border-slate-200 text-right">SGST</th>
                          </>
                        ) : (
                          <th className="p-2 border border-slate-200 text-right">IGST</th>
                        )}
                        <th className="p-2 border border-slate-200 text-right">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {totals.gst_summary.map((g, i) => (
                        <tr key={i}>
                          <td className="p-2 border border-slate-200 text-center font-bold">{g.gst_rate}%</td>
                          <td className="p-2 border border-slate-200 text-right">{formatCurrency(g.taxable_amount)}</td>
                          {isIntraState ? (
                            <>
                              <td className="p-2 border border-slate-200 text-right">{formatCurrency(g.cgst_amount)}</td>
                              <td className="p-2 border border-slate-200 text-right">{formatCurrency(g.sgst_amount)}</td>
                            </>
                          ) : (
                            <td className="p-2 border border-slate-200 text-right">{formatCurrency(g.igst_amount)}</td>
                          )}
                          <td className="p-2 border border-slate-200 text-right font-bold text-slate-900">
                            {formatCurrency(g.total_tax_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200">
                  <span className="font-bold text-slate-900">Amount in Words:</span>{' '}
                  <span className="italic font-medium">{amountWords}</span>
                </div>
              </div>

              {/* Invoice Totals Box (Right 5 cols) */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 font-medium text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                  Invoice Financial Summary
                </h3>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totals.subtotal)}</span>
                </div>

                {totals.discount_amount > 0 && (
                  <div className="flex justify-between border-b border-slate-100 pb-2 text-emerald-700">
                    <span>Discount:</span>
                    <span>- {formatCurrency(totals.discount_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Taxable Amount:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totals.taxable_amount)}</span>
                </div>

                {isIntraState ? (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">CGST Amount:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(totals.cgst_amount)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-600">SGST Amount:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(totals.sgst_amount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-600">IGST Amount:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(totals.igst_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-100 pb-2 text-[11px] text-slate-500">
                  <span>Round Off:</span>
                  <span className="font-mono">{totals.round_off >= 0 ? `+${totals.round_off.toFixed(2)}` : totals.round_off.toFixed(2)}</span>
                </div>

                <div className="flex justify-between rounded-xl bg-blue-600 p-4 text-white text-base font-extrabold shadow-md shadow-blue-600/20">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(totals.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
