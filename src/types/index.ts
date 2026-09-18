export interface CompanySettings {
  id: string;
  company_name: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  state_code: string;
  pincode: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account_number: string;
  bank_branch: string;
  bank_ifsc: string;
  invoice_prefix: string;
  next_invoice_number: number;
  terms_and_conditions: string;
  authorized_signatory: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  company_name: string;
  contact_person?: string;
  gstin?: string;
  pan?: string;
  phone?: string;
  alternate_phone?: string;
  email?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_state_code?: string;
  billing_pincode?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_state_code?: string;
  shipping_pincode?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Product {
  id: string;
  product_name: string;
  description?: string;
  hsn_code?: string;
  unit: string;
  default_rate: number;
  gst_rate: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'cancelled';

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_id?: string;
  
  // Customer Snapshot
  customer_name: string;
  customer_gstin?: string;
  customer_pan?: string;
  customer_phone?: string;
  customer_email?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_state_code?: string;
  billing_pincode?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_state_code?: string;
  shipping_pincode?: string;
  
  // Logistics
  order_number?: string;
  challan_number?: string;
  lr_rr_number?: string;
  vehicle_number?: string;
  transport?: string;
  place_of_supply?: string;
  place_of_supply_state_code?: string;
  reverse_charge: boolean;
  
  // Calculations
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  round_off: number;
  grand_total: number;
  amount_in_words: number | string;
  
  status: InvoiceStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  
  // Optional joined items
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  product_name: string;
  hsn_code?: string;
  quantity: number;
  unit: string;
  rate: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  gst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_amount: number;
  total_amount: number;
}

export interface GSTSummaryGroup {
  gst_rate: number;
  taxable_amount: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_tax_amount: number;
}
