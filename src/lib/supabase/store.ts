import { CompanySettings, Customer, Product, Invoice, InvoiceItem, InvoiceStatus } from '@/types';
import { createClient } from './client';

// Initial fallback seed data
export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  id: '11111111-1111-1111-1111-111111111111',
  company_name: 'SHRINIVAS ENTERPRISE',
  gstin: '27AAAAA0000A1Z5',
  pan: 'AAAAA0000A',
  address: 'Plot No. 42, Industrial Area, Sector 2',
  city: 'Mumbai',
  state: 'Maharashtra',
  state_code: '27',
  pincode: '400001',
  phone: '+91 98765 43210',
  email: 'sales@shrinivasenterprise.com',
  bank_name: 'HDFC Bank',
  bank_account_number: '50200012345678',
  bank_branch: 'Fort Branch, Mumbai',
  bank_ifsc: 'HDFC0000123',
  invoice_prefix: 'SG-',
  next_invoice_number: 204,
  terms_and_conditions: '1. Goods once sold will not be taken back or exchanged.\n2. Payment due within 15 days.\n3. Subject to Mumbai Jurisdiction.',
  authorized_signatory: 'For SHRINIVAS ENTERPRISE',
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    company_name: 'Darshan Jewel Tools',
    contact_person: 'Darshan Shah',
    gstin: '27ABCDE1234F1Z9',
    pan: 'ABCDE1234F',
    phone: '9820011223',
    alternate_phone: '02223456789',
    email: 'info@darshanjewel.com',
    billing_address: '105, Zaveri Bazaar Road, Kalbadevi',
    billing_city: 'Mumbai',
    billing_state: 'Maharashtra',
    billing_state_code: '27',
    billing_pincode: '400002',
    shipping_address: '105, Zaveri Bazaar Road, Kalbadevi',
    shipping_city: 'Mumbai',
    shipping_state: 'Maharashtra',
    shipping_state_code: '27',
    shipping_pincode: '400002',
    notes: 'Regular wholesale customer',
    is_active: true,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    company_name: 'Rajdeep Corporation',
    contact_person: 'Rajdeep Patel',
    gstin: '27AAACR1234A1Z1',
    pan: 'AAACR1234A',
    phone: '9898012345',
    email: 'accounts@rajdeepcorp.in',
    billing_address: 'G-12, MIDC Industrial Estate, Andheri East',
    billing_city: 'Mumbai',
    billing_state: 'Maharashtra',
    billing_state_code: '27',
    billing_pincode: '400093',
    shipping_address: 'G-12, MIDC Industrial Estate, Andheri East',
    shipping_city: 'Mumbai',
    shipping_state: 'Maharashtra',
    shipping_state_code: '27',
    shipping_pincode: '400093',
    notes: 'Intra-state B2B client',
    is_active: true,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    company_name: 'Raj Enterprises',
    contact_person: 'Rajesh Kumar',
    gstin: '27BBBPE5678B1Z2',
    pan: 'BBBPE5678B',
    phone: '9811223344',
    email: 'contact@rajenterprises.com',
    billing_address: 'Shop 4, Wagle Industrial Estate',
    billing_city: 'Thane',
    billing_state: 'Maharashtra',
    billing_state_code: '27',
    billing_pincode: '400604',
    shipping_address: 'Shop 4, Wagle Industrial Estate',
    shipping_city: 'Thane',
    shipping_state: 'Maharashtra',
    shipping_state_code: '27',
    shipping_pincode: '400604',
    is_active: true,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    company_name: 'Gujarat Tooling & Hardware Pvt Ltd',
    contact_person: 'Vikram Mehta',
    gstin: '24AAACG9999K1Z3',
    pan: 'AAACG9999K',
    phone: '9722009988',
    email: 'billing@gujarattooling.com',
    billing_address: 'Plot 88, GIDC Industrial Zone',
    billing_city: 'Ahmedabad',
    billing_state: 'Gujarat',
    billing_state_code: '24',
    billing_pincode: '380015',
    shipping_address: 'Plot 88, GIDC Industrial Zone',
    shipping_city: 'Ahmedabad',
    shipping_state: 'Gujarat',
    shipping_state_code: '24',
    shipping_pincode: '380015',
    notes: 'Inter-state customer (IGST applies)',
    is_active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    product_name: 'S S FLASK 304 4 X 9',
    description: 'Stainless Steel Flask 304 Grade 4x9 inches',
    hsn_code: '7305',
    unit: 'PCS',
    default_rate: 840.00,
    gst_rate: 18.00,
    is_active: true,
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    product_name: 'S S FLASK 304 2 X 2',
    description: 'Stainless Steel Flask 304 Grade 2x2 inches',
    hsn_code: '7305',
    unit: 'PCS',
    default_rate: 350.00,
    gst_rate: 18.00,
    is_active: true,
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    product_name: 'S S FLASK 304 2 X 4',
    description: 'Stainless Steel Flask 304 Grade 2x4 inches',
    hsn_code: '7305',
    unit: 'PCS',
    default_rate: 480.00,
    gst_rate: 18.00,
    is_active: true,
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    product_name: 'S S FLASK 304 3.5 X 8.5 WITHOUT COLLAR',
    description: 'Stainless Steel Flask 304 Grade 3.5x8.5 inches collarless',
    hsn_code: '7305',
    unit: 'PCS',
    default_rate: 760.00,
    gst_rate: 18.00,
    is_active: true,
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    product_name: 'Transport / Freight Charges',
    description: 'Transport and logistics charge',
    hsn_code: '7604',
    unit: 'LOT',
    default_rate: 250.00,
    gst_rate: 18.00,
    is_active: true,
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'i2032030-2030-2030-2030-203020302030',
    invoice_number: 'SG-203',
    invoice_date: new Date().toISOString().split('T')[0],
    customer_id: 'c1111111-1111-1111-1111-111111111111',
    customer_name: 'Darshan Jewel Tools',
    customer_gstin: '27ABCDE1234F1Z9',
    customer_pan: 'ABCDE1234F',
    customer_phone: '9820011223',
    customer_email: 'info@darshanjewel.com',
    billing_address: '105, Zaveri Bazaar Road, Kalbadevi',
    billing_city: 'Mumbai',
    billing_state: 'Maharashtra',
    billing_state_code: '27',
    billing_pincode: '400002',
    shipping_address: '105, Zaveri Bazaar Road, Kalbadevi',
    shipping_city: 'Mumbai',
    shipping_state: 'Maharashtra',
    shipping_state_code: '27',
    shipping_pincode: '400002',
    order_number: 'PO-8891',
    challan_number: 'CH-402',
    lr_rr_number: 'LR-9921',
    vehicle_number: 'MH-02-CL-4412',
    transport: 'V-Trans Logistics',
    place_of_supply: 'Maharashtra',
    place_of_supply_state_code: '27',
    reverse_charge: false,
    subtotal: 15175.50,
    discount_amount: 0.00,
    taxable_amount: 15175.50,
    cgst_amount: 1365.79,
    sgst_amount: 1365.79,
    igst_amount: 0.00,
    round_off: -0.08,
    grand_total: 17907.00,
    amount_in_words: 'Rupees Seventeen Thousand Nine Hundred Seven Only',
    status: 'issued',
    created_at: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        product_id: 'p1111111-1111-1111-1111-111111111111',
        product_name: 'S S FLASK 304 4 X 9',
        hsn_code: '7305',
        quantity: 10,
        unit: 'PCS',
        rate: 840.00,
        discount_percent: 0,
        discount_amount: 0,
        taxable_amount: 8400.00,
        gst_rate: 18,
        cgst_amount: 756.00,
        sgst_amount: 756.00,
        igst_amount: 0,
        gst_amount: 1512.00,
        total_amount: 9912.00,
      },
      {
        id: 'item-2',
        product_id: 'p2222222-2222-2222-2222-222222222222',
        product_name: 'S S FLASK 304 2 X 2',
        hsn_code: '7305',
        quantity: 10,
        unit: 'PCS',
        rate: 350.00,
        discount_percent: 0,
        discount_amount: 0,
        taxable_amount: 3500.00,
        gst_rate: 18,
        cgst_amount: 315.00,
        sgst_amount: 315.00,
        igst_amount: 0,
        gst_amount: 630.00,
        total_amount: 4130.00,
      },
      {
        id: 'item-3',
        product_id: 'p4444444-4444-4444-4444-444444444444',
        product_name: 'S S FLASK 304 3.5 X 8.5 WITHOUT COLLAR',
        hsn_code: '7305',
        quantity: 4,
        unit: 'PCS',
        rate: 760.00,
        discount_percent: 0,
        discount_amount: 0,
        taxable_amount: 3040.00,
        gst_rate: 18,
        cgst_amount: 273.60,
        sgst_amount: 273.60,
        igst_amount: 0,
        gst_amount: 547.20,
        total_amount: 3587.20,
      },
      {
        id: 'item-4',
        product_id: 'p5555555-5555-5555-5555-555555555555',
        product_name: 'Transport / Freight Charges',
        hsn_code: '7604',
        quantity: 1,
        unit: 'LOT',
        rate: 235.50,
        discount_percent: 0,
        discount_amount: 0,
        taxable_amount: 235.50,
        gst_rate: 18,
        cgst_amount: 21.195,
        sgst_amount: 21.195,
        igst_amount: 0,
        gst_amount: 42.39,
        total_amount: 277.89,
      }
    ]
  }
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return url !== '' && !url.includes('placeholder.supabase.co');
}

// Storage helpers using LocalStorage when offline/unconfigured
function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// DATA ACCESS LAYER
export const DataStore = {
  // --- COMPANY SETTINGS ---
  async getCompanySettings(): Promise<CompanySettings> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('company_settings').select('*').limit(1).maybeSingle();
      if (data) return data;
    }
    return getLocalStorage('billing_company_settings', INITIAL_COMPANY_SETTINGS);
  },

  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const current = await this.getCompanySettings();
      const { data, error } = await supabase
        .from('company_settings')
        .upsert({ ...current, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && data) return data;
    }
    const current = getLocalStorage('billing_company_settings', INITIAL_COMPANY_SETTINGS);
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    setLocalStorage('billing_company_settings', updated);
    return updated;
  },

  // --- CUSTOMERS ---
  async getCustomers(searchQuery = ''): Promise<Customer[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      let q = supabase.from('customers').select('*').eq('is_active', true);
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        q = q.or(`company_name.ilike.${term},gstin.ilike.${term},phone.ilike.${term}`);
      }
      const { data } = await q.order('company_name');
      if (data) return data;
    }
    const list = getLocalStorage('billing_customers', INITIAL_CUSTOMERS).filter(c => c.is_active);
    if (!searchQuery.trim()) return list;
    const term = searchQuery.toLowerCase();
    return list.filter(c =>
      c.company_name.toLowerCase().includes(term) ||
      (c.gstin && c.gstin.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term))
    );
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
      if (data) return data;
    }
    const list = getLocalStorage('billing_customers', INITIAL_CUSTOMERS);
    return list.find(c => c.id === id) || null;
  },

  async saveCustomer(customerData: Omit<Customer, 'id'> & { id?: string }): Promise<Customer> {
    const isNew = !customerData.id;
    const id = customerData.id || crypto.randomUUID();
    const customer: Customer = {
      ...customerData,
      id,
      is_active: customerData.is_active ?? true,
      updated_at: new Date().toISOString(),
      created_at: customerData.created_at || new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('customers').upsert(customer).select().single();
      if (!error && data) return data;
    }

    const list = getLocalStorage('billing_customers', INITIAL_CUSTOMERS);
    const existingIndex = list.findIndex(c => c.id === id);
    if (existingIndex >= 0) {
      list[existingIndex] = customer;
    } else {
      list.unshift(customer);
    }
    setLocalStorage('billing_customers', list);
    return customer;
  },

  async archiveCustomer(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from('customers').update({ is_active: false }).eq('id', id);
    }
    const list = getLocalStorage('billing_customers', INITIAL_CUSTOMERS);
    const item = list.find(c => c.id === id);
    if (item) {
      item.is_active = false;
      setLocalStorage('billing_customers', list);
    }
  },

  // --- PRODUCTS ---
  async getProducts(searchQuery = ''): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      let q = supabase.from('products').select('*').eq('is_active', true);
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        q = q.or(`product_name.ilike.${term},hsn_code.ilike.${term}`);
      }
      const { data } = await q.order('product_name');
      if (data) return data;
    }

    const list = getLocalStorage('billing_products', INITIAL_PRODUCTS).filter(p => p.is_active);
    if (!searchQuery.trim()) return list;
    const term = searchQuery.toLowerCase();
    return list.filter(p =>
      p.product_name.toLowerCase().includes(term) ||
      (p.hsn_code && p.hsn_code.toLowerCase().includes(term))
    );
  },

  async saveProduct(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const id = productData.id || crypto.randomUUID();
    const product: Product = {
      ...productData,
      id,
      is_active: productData.is_active ?? true,
      updated_at: new Date().toISOString(),
      created_at: productData.created_at || new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('products').upsert(product).select().single();
      if (!error && data) return data;
    }

    const list = getLocalStorage('billing_products', INITIAL_PRODUCTS);
    const index = list.findIndex(p => p.id === id);
    if (index >= 0) {
      list[index] = product;
    } else {
      list.unshift(product);
    }
    setLocalStorage('billing_products', list);
    return product;
  },

  async archiveProduct(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from('products').update({ is_active: false }).eq('id', id);
    }
    const list = getLocalStorage('billing_products', INITIAL_PRODUCTS);
    const item = list.find(p => p.id === id);
    if (item) {
      item.is_active = false;
      setLocalStorage('billing_products', list);
    }
  },

  // --- INVOICES ---
  async getNextInvoiceNumber(): Promise<string> {
    const settings = await this.getCompanySettings();
    const prefix = settings.invoice_prefix || 'SG-';
    const num = settings.next_invoice_number || 101;
    return `${prefix}${num}`;
  },

  async getInvoices(filters?: {
    search?: string;
    status?: string;
    customer_id?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Invoice[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      let q = supabase.from('invoices').select('*, items:invoice_items(*)');
      if (filters?.search) {
        const term = `%${filters.search.trim()}%`;
        q = q.or(`invoice_number.ilike.${term},customer_name.ilike.${term},customer_gstin.ilike.${term}`);
      }
      if (filters?.status && filters.status !== 'all') {
        q = q.eq('status', filters.status);
      }
      if (filters?.customer_id) {
        q = q.eq('customer_id', filters.customer_id);
      }
      if (filters?.fromDate) {
        q = q.gte('invoice_date', filters.fromDate);
      }
      if (filters?.toDate) {
        q = q.lte('invoice_date', filters.toDate);
      }
      const { data } = await q.order('created_at', { ascending: false });
      if (data) return data;
    }

    let list = getLocalStorage('billing_invoices', INITIAL_INVOICES);
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      list = list.filter(inv =>
        inv.invoice_number.toLowerCase().includes(term) ||
        inv.customer_name.toLowerCase().includes(term) ||
        (inv.customer_gstin && inv.customer_gstin.toLowerCase().includes(term))
      );
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(inv => inv.status === filters.status);
    }
    if (filters?.customer_id) {
      list = list.filter(inv => inv.customer_id === filters.customer_id);
    }
    if (filters?.fromDate) {
      list = list.filter(inv => inv.invoice_date >= filters.fromDate!);
    }
    if (filters?.toDate) {
      list = list.filter(inv => inv.invoice_date <= filters.toDate!);
    }
    return list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*)')
        .eq('id', id)
        .maybeSingle();
      if (data) return data;
    }

    const list = getLocalStorage('billing_invoices', INITIAL_INVOICES);
    return list.find(i => i.id === id) || null;
  },

  async saveInvoice(invoiceData: Omit<Invoice, 'id'> & { id?: string }): Promise<Invoice> {
    const isNew = !invoiceData.id;
    const id = invoiceData.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const invoice: Invoice = {
      ...invoiceData,
      id,
      created_at: invoiceData.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { items, ...headerData } = invoice;
      
      const { data: savedHeader, error } = await supabase
        .from('invoices')
        .upsert(headerData)
        .select()
        .single();

      if (!error && savedHeader) {
        if (items && items.length > 0) {
          // Delete existing items if updating
          await supabase.from('invoice_items').delete().eq('invoice_id', id);
          
          const lineItems = items.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            invoice_id: id,
          }));
          await supabase.from('invoice_items').insert(lineItems);
        }

        // Increment company next_invoice_number if new invoice created
        if (isNew) {
          const settings = await this.getCompanySettings();
          await this.updateCompanySettings({ next_invoice_number: (settings.next_invoice_number || 101) + 1 });
        }

        return (await this.getInvoiceById(id))!;
      }
    }

    // Fallback Local Storage logic
    const list = getLocalStorage('billing_invoices', INITIAL_INVOICES);
    const index = list.findIndex(i => i.id === id);
    if (index >= 0) {
      list[index] = invoice;
    } else {
      list.unshift(invoice);
    }
    setLocalStorage('billing_invoices', list);

    if (isNew) {
      const settings = getLocalStorage('billing_company_settings', INITIAL_COMPANY_SETTINGS);
      settings.next_invoice_number = (settings.next_invoice_number || 101) + 1;
      setLocalStorage('billing_company_settings', settings);
    }

    return invoice;
  },

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    }

    const list = getLocalStorage('billing_invoices', INITIAL_INVOICES);
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      setLocalStorage('billing_invoices', list);
    }
  },
};
