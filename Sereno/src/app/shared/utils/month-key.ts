export function getCurrentMonthKey(referenceDate = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = (referenceDate.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

export function isDateInMonth(isoDate: string, monthKey: string): boolean {
  return isoDate.startsWith(monthKey);
}
