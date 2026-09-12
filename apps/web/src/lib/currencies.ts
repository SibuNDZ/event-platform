export const SUPPORTED_CURRENCIES = [
  { code: 'ZAR', label: 'ZAR · South African rand' },
  { code: 'USD', label: 'USD · US dollar' },
  { code: 'EUR', label: 'EUR · Euro' },
  { code: 'GBP', label: 'GBP · British pound' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];
