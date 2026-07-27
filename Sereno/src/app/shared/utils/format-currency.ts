import { CurrencyCode } from '../../core/models/settings.model';

const THIN_SPACE = '\u202f';
const NO_BREAK_SPACE = '\u00a0';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'Fr',
};

let activeCurrency: CurrencyCode = 'EUR';
let activeShowCents = true;

/** Appliqué quand les réglages changent (devise / centimes). */
export function configureCurrencyFormat(options: {
  currency?: CurrencyCode;
  showCents?: boolean;
}): void {
  if (options.currency) {
    activeCurrency = options.currency;
  }
  if (options.showCents !== undefined) {
    activeShowCents = options.showCents;
  }
}

/**
 * Formate un montant en centimes (ex. 1 234,56 €).
 */
export function formatCurrency(
  amountInCents: number,
  options?: { showSign?: boolean; currency?: CurrencyCode; showCents?: boolean },
): string {
  const isNegative = amountInCents < 0;
  const absoluteCents = Math.abs(amountInCents);
  const currency = options?.currency ?? activeCurrency;
  const showCents = options?.showCents ?? activeShowCents;
  const symbol = CURRENCY_SYMBOLS[currency];

  const euros = Math.floor(absoluteCents / 100);
  const cents = absoluteCents % 100;
  const formattedEuros = euros.toString().replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
  const sign = options?.showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : '';

  if (!showCents) {
    return `${sign}${formattedEuros}${NO_BREAK_SPACE}${symbol}`;
  }

  const formattedCents = cents.toString().padStart(2, '0');
  return `${sign}${formattedEuros},${formattedCents}${NO_BREAK_SPACE}${symbol}`;
}

/**
 * Calcule le pourcentage d'avancement, borné entre 0 et 100.
 */
export function calculateProgressPercent(spent: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((spent / total) * 1000) / 10);
}
