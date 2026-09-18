-- Seed data for development and initial setup

-- 1. Insert default seller company settings if not exists
INSERT INTO company_settings (
    company_name,
    gstin,
    pan,
    address,
    city,
    state,
    state_code,
    pincode,
    phone,
    email,
    bank_name,
    bank_account_number,
    bank_branch,
    bank_ifsc,
    invoice_prefix,
    next_invoice_number,
    terms_and_conditions,
    authorized_signatory
) VALUES (
    'SHRINIVAS ENTERPRISE',
    '27AAAAA0000A1Z5',
    'AAAAA0000A',
    'Plot No. 42, Industrial Area, Sector 2',
    'Mumbai',
    'Maharashtra',
    '27',
    '400001',
    '+91 98765 43210',
    'sales@shrinivasenterprise.com',
    'HDFC Bank',
    '50200012345678',
    'Fort Branch, Mumbai',
    'HDFC0000123',
    'SG-',
    203,
    '1. Goods once sold will not be taken back or exchanged. 2. Payment due within 15 days. 3. Subject to Mumbai Jurisdiction.',
    'For SHRINIVAS ENTERPRISE'
) ON CONFLICT DO NOTHING;

-- 2. Insert sample customers
INSERT INTO customers (
    company_name,
    contact_person,
    gstin,
    pan,
    phone,
    alternate_phone,
    email,
    billing_address,
    billing_city,
    billing_state,
    billing_state_code,
    billing_pincode,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_state_code,
    shipping_pincode,
    notes
) VALUES 
(
    'Darshan Jewel Tools',
    'Darshan Shah',
    '27ABCDE1234F1Z9',
    'ABCDE1234F',
    '9820011223',
    '02223456789',
    'info@darshanjewel.com',
    '105, Zaveri Bazaar Road, Kalbadevi',
    'Mumbai',
    'Maharashtra',
    '27',
    '400002',
    '105, Zaveri Bazaar Road, Kalbadevi',
    'Mumbai',
    'Maharashtra',
    '27',
    '400002',
    'Regular wholesale customer'
),
(
    'Rajdeep Corporation',
    'Rajdeep Patel',
    '27AAACR1234A1Z1',
    'AAACR1234A',
    '9898012345',
    '',
    'accounts@rajdeepcorp.in',
    'G-12, MIDC Industrial Estate, Andheri East',
    'Mumbai',
    'Maharashtra',
    '27',
    '400093',
    'G-12, MIDC Industrial Estate, Andheri East',
    'Mumbai',
    'Maharashtra',
    '27',
    '400093',
    'Intra-state B2B client'
),
(
    'Raj Enterprises',
    'Rajesh Kumar',
    '27BBBPE5678B1Z2',
    'BBBPE5678B',
    '9811223344',
    '',
    'contact@rajenterprises.com',
    'Shop 4, Wagle Industrial Estate',
    'Thane',
    'Maharashtra',
    '27',
     me: '400604',
    'Shop 4, Wagle Industrial Estate',
    'Thane',
    'Maharashtra',
    '27',
    '400604',
    ''
),
(
    'Gujarat Tooling & Hardware Pvt Ltd',
    'Vikram Mehta',
    '24AAACG9999K1Z3',
    'AAACG9999K',
    '9722009988',
    '',
    'billing@gujarattooling.com',
    'Plot 88, GIDC Industrial Zone',
    'Ahmedabad',
    'Gujarat',
    '24',
    '380015',
    'Plot 88, GIDC Industrial Zone',
    'Ahmedabad',
    'Gujarat',
    '24',
    '380015',
    'Inter-state customer (IGST applies)'
) ON CONFLICT DO NOTHING;

-- 3. Insert sample products catalog
INSERT INTO products (
    product_name,
    description,
    hsn_code,
    unit,
    default_rate,
    gst_rate
) VALUES 
(
    'S S FLASK 304 4 X 9',
    'Stainless Steel Flask 304 Grade 4x9 inches',
    '7305',
    'PCS',
    840.00,
    18.00
),
(
    'S S FLASK 304 2 X 2',
    'Stainless Steel Flask 304 Grade 2x2 inches',
    '7305',
    'PCS',
    350.00,
    18.00
),
(
    'S S FLASK 304 2 X 4',
    'Stainless Steel Flask 304 Grade 2x4 inches',
    '7305',
    'PCS',
    480.00,
    18.00
),
(
    'S S FLASK 304 3.5 X 8.5 WITHOUT COLLAR',
    'Stainless Steel Flask 304 Grade 3.5x8.5 inches collarless',
    '7305',
    'PCS',
    760.00,
    18.00
),
(
    'Transport / Freight Charges',
    'Transport and logistics charge',
    '7604',
    'LOT',
    250.00,
    18.00
) ON CONFLICT DO NOTHING;
