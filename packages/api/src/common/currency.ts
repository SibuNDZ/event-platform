/** ISO 4217 currency codes are exactly three letters (Stripe rejects anything else). */
export const ISO_CURRENCY_CODE = /^[A-Za-z]{3}$/;

export const CURRENCY_MESSAGE = 'currency must be a 3-letter ISO code such as ZAR';

export function normalizeCurrency(code: string): string;
export function normalizeCurrency(code: string | undefined): string | undefined;
export function normalizeCurrency(code: string | undefined): string | undefined {
  return code === undefined ? undefined : code.trim().toUpperCase();
}
