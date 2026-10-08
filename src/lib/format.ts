/**
 * Input formatting and validation for Singapore. Error messages say how to fix
 * the problem (brief §17), never just "Invalid".
 */

/* -------------------------------------------------------------------------- */
/* Phone (+65)                                                                */
/* -------------------------------------------------------------------------- */

/** "+65 …" or "0065 …": an explicit country code, whatever follows. */
const explicitCountryCode = /^(\+|00)\s*65/;

/**
 * Digits only, with the country code removed. An explicit "+65" / "0065" is
 * always removed, even if the rest is incomplete, so "+65 912345" is read as
 * 6 digits rather than as the number 6591 2345. A bare "65" is only treated
 * as a country code when 10 digits are typed, because landlines can start 65.
 */
export function normalizeSgPhone(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (explicitCountryCode.test(trimmed)) return digits.replace(/^(00)?65/, "");
  return digits.length === 10 && digits.startsWith("65") ? digits.slice(2) : digits;
}

/** 91234567 -> "9123 4567". Incomplete numbers lose an explicit country code but are otherwise left as typed. */
export function formatSgPhone(input: string): string {
  const digits = normalizeSgPhone(input);
  if (digits.length === 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return explicitCountryCode.test(input.trim()) ? digits : input.trim();
}

/**
 * Singapore numbers are 8 digits: 8 or 9 for mobiles, 6 for landlines, 3 for
 * VoIP. WhatsApp and SMS need a mobile, so `mobileOnly` defaults to true.
 */
export function validateSgPhone(input: string, { mobileOnly = true } = {}): string | null {
  const digits = normalizeSgPhone(input);
  if (!digits) return mobileOnly ? "Enter your mobile number" : "Enter your phone number";
  if (digits.length !== 8) return "Enter an 8-digit Singapore number, like 9123 4567";
  if (mobileOnly && !/^[89]/.test(digits)) return "Enter a Singapore mobile number starting with 8 or 9";
  if (!/^[3689]/.test(digits)) return "Enter a Singapore number starting with 3, 6, 8 or 9";
  return null;
}

/* -------------------------------------------------------------------------- */
/* Money (S$)                                                                 */
/* -------------------------------------------------------------------------- */

const amountFormat = new Intl.NumberFormat("en-SG", { maximumFractionDigits: 2 });

/**
 * Parses what people type into an amount field: "25000", "25,000",
 * "S$ 25,000.50". Empty input is null, never 0 (brief A3: an unanswered
 * field is not zero). Anything else unreadable is NaN.
 */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/s\$|\$|sgd|,|\s/gi, "");
  if (!cleaned) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}

/** 25000 -> "25,000". The S$ prefix is shown by the field, not the value. */
export function formatAmount(value: number): string {
  return amountFormat.format(value);
}

export function validateAmount(
  input: string,
  { required = true, min, max }: { required?: boolean; min?: number; max?: number } = {},
): string | null {
  const value = parseAmount(input);
  if (value === null) return required ? "Enter an amount, like 25,000" : null;
  if (Number.isNaN(value)) return "Enter the amount in numbers only, like 25,000";
  if (min !== undefined && max !== undefined && (value < min || value > max)) {
    return `Enter an amount between S$${formatAmount(min)} and S$${formatAmount(max)}`;
  }
  if (min !== undefined && value < min) return `Enter an amount of at least S$${formatAmount(min)}`;
  if (max !== undefined && value > max) return `Enter an amount of S$${formatAmount(max)} or less`;
  return null;
}

/* -------------------------------------------------------------------------- */
/* Email                                                                      */
/* -------------------------------------------------------------------------- */

export function validateEmail(input: string): string | null {
  const value = input.trim();
  if (!value) return "Enter your email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Enter your email in the format name@example.com";
  return null;
}

/** Common email domains in Singapore, for spotting a likely typo (brief §24 "Email typo"). */
const commonDomains = [
  "gmail.com",
  "yahoo.com",
  "yahoo.com.sg",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "live.com",
  "singnet.com.sg",
  "starhub.net.sg",
];

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

/**
 * "ana@gmial.com" -> "ana@gmail.com". A suggestion only, never a
 * correction: the person decides. Null when the domain looks fine.
 */
export function suggestEmail(input: string): string | null {
  const value = input.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1) return null;
  const domain = value.slice(at + 1);
  if (!domain || commonDomains.includes(domain)) return null;
  let best: string | null = null;
  let bestDistance = 3;
  for (const candidate of commonDomains) {
    const distance = editDistance(domain, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best && bestDistance <= 2 ? `${input.trim().slice(0, at)}@${best}` : null;
}
