const singleDigits = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tensDigits = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertTwoDigits(n: number): string {
  if (n < 20) return singleDigits[n];
  const tens = Math.floor(n / 10);
  const remainder = n % 10;
  return (tensDigits[tens] + (remainder > 0 ? " " + singleDigits[remainder] : "")).trim();
}

function convertThreeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;
  let res = "";
  if (hundred > 0) {
    res += singleDigits[hundred] + " Hundred";
  }
  if (remainder > 0) {
    if (res.length > 0) res += " ";
    res += convertTwoDigits(remainder);
  }
  return res;
}

/**
 * Converts a numeric amount into Indian Currency Words.
 * e.g. 17907.00 => "Rupees Seventeen Thousand Nine Hundred Seven Only"
 */
export function convertAmountToWords(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "Zero Rupees Only";
  }

  const absoluteVal = Math.abs(amount);
  const rupees = Math.floor(absoluteVal);
  const paise = Math.round((absoluteVal - rupees) * 100);

  if (rupees === 0 && paise === 0) {
    return "Rupees Zero Only";
  }

  let rupeeStr = "";

  if (rupees > 0) {
    let tempRupees = rupees;

    // Crores (10,00,00,000)
    const crores = Math.floor(tempRupees / 10000000);
    tempRupees %= 10000000;

    // Lakhs (1,00,000)
    const lakhs = Math.floor(tempRupees / 100000);
    tempRupees %= 100000;

    // Thousands (1,000)
    const thousands = Math.floor(tempRupees / 1000);
    tempRupees %= 1000;

    // Hundreds & Below (100)
    const remaining = tempRupees;

    if (crores > 0) {
      rupeeStr += (rupeeStr ? " " : "") + convertTwoDigits(crores) + " Crore";
    }

    if (lakhs > 0) {
      rupeeStr += (rupeeStr ? " " : "") + convertTwoDigits(lakhs) + " Lakh";
    }

    if (thousands > 0) {
      rupeeStr += (rupeeStr ? " " : "") + convertTwoDigits(thousands) + " Thousand";
    }

    if (remaining > 0) {
      rupeeStr += (rupeeStr ? " " : "") + convertThreeDigits(remaining);
    }
  }

  let result = "Rupees " + (rupeeStr.trim() || "Zero");

  if (paise > 0) {
    result += " and " + convertTwoDigits(paise) + " Paise";
  }

  result += " Only";
  return result;
}
