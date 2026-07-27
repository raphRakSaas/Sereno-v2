const THIN_SPACE = '\u202f';
const NO_BREAK_SPACE = '\u00a0';

/**
 * Formate un montant en centimes vers le format français (ex. 1 234,56 €).
 */
export function formatCurrency(amountInCents: number, options?: { showSign?: boolean }): string {
  const isNegative = amountInCents < 0;
  const absoluteCents = Math.abs(amountInCents);
  const euros = Math.floor(absoluteCents / 100);
  const cents = absoluteCents % 100;

  const formattedEuros = euros
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
  const formattedCents = cents.toString().padStart(2, '0');
  const sign = options?.showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : '';

  return `${sign}${formattedEuros},${formattedCents}${NO_BREAK_SPACE}€`;
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
