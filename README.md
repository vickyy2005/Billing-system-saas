# Production-Ready B2B GST Invoice & Billing Management System

A production B2B GST Billing and Invoice Management web application built for Indian businesses. 

## Features

- **Database Persistence & RLS**: Full Supabase PostgreSQL integration (`company_settings`, `customers`, `products`, `invoices`, `invoice_items`) with Row Level Security policies.
- **Fast Debounced Autocomplete**: Server-side search by company name, GSTIN, or phone number with full keyboard navigation.
- **Automated GST Tax Engine**: Detects Intra-State (CGST + SGST) vs Inter-State (IGST) transactions based on seller state vs place of supply state code.
- **Immutable Historical Records**: Customer and product details are snapshotted on generated invoices to preserve past records when master databases are updated.
- **A4 Print-Ready Layout & PDF**: Custom `@media print` CSS for pixel-perfect A4 printable invoices matching standard Indian B2B formats.
- **Currency Words & Rounding**: Converts monetary totals to Indian currency words (*"Rupees Seventeen Thousand Nine Hundred Seven Only"*) and calculates round-off.
- **Invoice Duplication**: Duplicate existing invoices as templates under new invoice numbers without overwriting historical records.
- **Business Dashboard & Reports**: Metrics overview, recent invoices list, sales reports, customer breakdown, monthly sales, and GST summaries with CSV export.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **Icons**: Lucide React
- **Validation**: Zod + React Hook Form

## Getting Started

### 1. Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Migrations
Run the SQL files in your Supabase project's SQL Editor:
1. `supabase/migrations/20260918000000_init_schema.sql`
2. `supabase/seed.sql`

### 3. Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
Default credentials: `sales@shrinivasenterprise.com` / `password123`.

## Deployment
Deploys seamlessly to Vercel with zero extra configuration. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables.
