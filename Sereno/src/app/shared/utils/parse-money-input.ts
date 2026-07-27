/**
 * Convertit une saisie utilisateur (ex. "1 234,56") en centimes entiers.
 * Retourne null si la valeur est vide ou invalide.
 */
export function parseMoneyInput(rawValue: string): number | null {
  const normalized = rawValue.trim().replace(/\s/g, '').replace(',', '.');

  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const [eurosPart, centsPart = ''] = normalized.split('.');
  const euros = Number(eurosPart);
  const cents = Number(centsPart.padEnd(2, '0').slice(0, 2));

  if (!Number.isFinite(euros) || !Number.isFinite(cents)) {
    return null;
  }

  return euros * 100 + cents;
}

/**
 * Formate des centimes pour un champ de saisie (ex. 123456 -> "1234,56").
 */
export function formatMoneyInput(amountInCents: number): string {
  const absoluteCents = Math.abs(amountInCents);
  const euros = Math.floor(absoluteCents / 100);
  const cents = (absoluteCents % 100).toString().padStart(2, '0');
  return `${euros},${cents}`;
}
