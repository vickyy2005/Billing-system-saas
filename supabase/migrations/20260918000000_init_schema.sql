-- Initialize schema for B2B GST Billing System

-- Extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANY SETTINGS (Seller Information)
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'SHRINIVAS ENTERPRISE',
    gstin TEXT,
    pan TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    state_code TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_branch TEXT,
    bank_ifsc TEXT,
    invoice_prefix TEXT DEFAULT 'INV-',
    next_invoice_number INTEGER DEFAULT 1,
    terms_and_conditions TEXT,
    authorized_signatory TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CUSTOMERS (Buyers)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT,
    gstin TEXT,
    pan TEXT,
    phone TEXT,
    alternate_phone TEXT,
    email TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_state_code TEXT,
    billing_pincode TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_state_code TEXT,
    shipping_pincode TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for fast customer lookup
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_gstin ON customers(gstin);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- 3. PRODUCTS (Master Catalog)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    description TEXT,
    hsn_code TEXT,
    unit TEXT DEFAULT 'PCS',
    default_rate NUMERIC(12,2) DEFAULT 0.00 CHECK (default_rate >= 0),
    gst_rate NUMERIC(5,2) DEFAULT 18.00 CHECK (gst_rate >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for product search
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_hsn ON products(hsn_code);

-- 4. INVOICES (Master Header)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Customer Snapshot
    customer_name TEXT NOT NULL,
    customer_gstin TEXT,
    customer_pan TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_state_code TEXT,
    billing_pincode TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_state_code TEXT,
    shipping_pincode TEXT,
    
    -- Order & Logistics
    order_number TEXT,
    challan_number TEXT,
    lr_rr_number TEXT,
    vehicle_number TEXT,
    transport TEXT,
    place_of_supply TEXT,
    place_of_supply_state_code TEXT,
    reverse_charge BOOLEAN DEFAULT false,
    
    -- Financial Totals
    subtotal NUMERIC(12,2) DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    taxable_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (taxable_amount >= 0),
    cgst_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (cgst_amount >= 0),
    sgst_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (sgst_amount >= 0),
    igst_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (igst_amount >= 0),
    round_off NUMERIC(12,2) DEFAULT 0.00,
    grand_total NUMERIC(12,2) DEFAULT 0.00 CHECK (grand_total >= 0),
    amount_in_words TEXT,
    
    -- Status & Metadata
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 5. INVOICE ITEMS (Line Items Snapshot)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product Snapshot
    product_name TEXT NOT NULL,
    hsn_code TEXT,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit TEXT DEFAULT 'PCS',
    rate NUMERIC(12,2) NOT NULL CHECK (rate >= 0),
    discount_percent NUMERIC(5,2) DEFAULT 0.00 CHECK (discount_percent >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    taxable_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (taxable_amount >= 0),
    gst_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (gst_rate >= 0),
    cgst_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (cgst_amount >= 0),
    sgst_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (sgst_amount >= 0),
    igst_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (igst_amount >= 0),
    gst_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (gst_amount >= 0),
    total_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (total_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR AUTHENTICATED USERS
-- Company Settings
CREATE POLICY "Allow authenticated users access to company_settings"
    ON company_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Customers
CREATE POLICY "Allow authenticated users access to customers"
    ON customers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Products
CREATE POLICY "Allow authenticated users access to products"
    ON products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoices
CREATE POLICY "Allow authenticated users access to invoices"
    ON invoices FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoice Items
CREATE POLICY "Allow authenticated users access to invoice_items"
    ON invoice_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
