import { z } from 'zod';
import { GSTIN_REGEX, PAN_REGEX } from '@/lib/utils/formatters';

export const customerSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_person: z.string().optional(),
  gstin: z.string().optional().refine(val => !val || GSTIN_REGEX.test(val.trim().toUpperCase()), {
    message: 'Invalid GSTIN format (e.g. 27ABCDE1234F1Z9)',
  }),
  pan: z.string().optional().refine(val => !val || PAN_REGEX.test(val.trim().toUpperCase()), {
    message: 'Invalid PAN format (e.g. ABCDE1234F)',
  }),
  phone: z.string().min(1, 'Phone number is required'),
  alternate_phone: z.string().optional(),
  email: z.string().optional().refine(val => !val || z.string().email().safeParse(val).success, {
    message: 'Invalid email address',
  }),
  billing_address: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_state_code: z.string().optional(),
  billing_pincode: z.string().optional(),
  shipping_address: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_state_code: z.string().optional(),
  shipping_pincode: z.string().optional(),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  hsn_code: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  default_rate: z.number().min(0, 'Rate cannot be negative'),
  gst_rate: z.number().min(0, 'GST rate cannot be negative'),
});

export const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  state_code: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_branch: z.string().optional(),
  bank_ifsc: z.string().optional(),
  invoice_prefix: z.string().default('SG-'),
  next_invoice_number: z.number().min(1).default(1),
  terms_and_conditions: z.string().optional(),
  authorized_signatory: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
