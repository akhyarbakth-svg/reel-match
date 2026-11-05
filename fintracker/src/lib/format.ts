/** Bangladeshi digit grouping: 1,50,000 / 12,34,567. */
export function groupBD(digits: string): string {
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
}

type MoneyOptions = {
  /** Show paisa (two decimals). Defaults to true. */
  decimals?: boolean;
  /** Always show + or − in front. */
  sign?: boolean;
};

const MINUS = '−';

/** Formats taka as text, e.g. "Tk 1,250.00", "−Tk 280.00", "+Tk 7,000.00". */
export function formatTk(value: number, { decimals = true, sign = false }: MoneyOptions = {}): string {
  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals ? 2 : 0);
  const [int, frac] = fixed.split('.');
  const body = `Tk ${groupBD(int)}${decimals ? `.${frac}` : ''}`;
  if (sign) return `${value < 0 ? MINUS : '+'}${body}`;
  return value < 0 ? `${MINUS}${body}` : body;
}

/** Number without the currency prefix: "48,250" (used next to a separate "Tk" label). */
export function formatNumber(value: number, decimals = false): string {
  const [int, frac] = Math.abs(value).toFixed(decimals ? 2 : 0).split('.');
  return groupBD(int) + (decimals ? `.${frac}` : '');
}

/** Parses what a person typed into an amount field. Returns 0 when it is not a number. */
export function parseAmount(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/** Keeps an amount field to digits and one decimal point with at most 2 decimals. */
export function sanitizeAmountInput(text: string): string {
  let out = text.replace(/[^0-9.]/g, '');
  const firstDot = out.indexOf('.');
  if (firstDot !== -1) {
    out = out.slice(0, firstDot + 1) + out.slice(firstDot + 1).replace(/\./g, '');
    const [int, frac] = out.split('.');
    out = `${int}.${frac.slice(0, 2)}`;
  }
  return out.slice(0, 12);
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
