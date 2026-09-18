export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00";
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

// GSTIN Regex: 2 digits state code, 5 alpha, 4 numeric, 1 alpha, 1 numeric/alpha, 1 Z/alpha, 1 check digit
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

export function isValidGSTIN(gstin?: string): boolean {
  if (!gstin) return true; // Optional field allowed
  return GSTIN_REGEX.test(gstin.trim().toUpperCase());
}

export function isValidPAN(pan?: string): boolean {
  if (!pan) return true;
  return PAN_REGEX.test(pan.trim().toUpperCase());
}
