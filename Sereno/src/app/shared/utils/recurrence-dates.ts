import { RecurrenceFrequency } from '../../core/models/recurrence.model';

/**
 * Calcule les dates d'occurrence dues pour une récurrence.
 * Logique pure (pas d'IndexedDB) — facile à tester unitairement.
 */
export function listDueOccurrenceDates(options: {
  startDate: string;
  frequency: RecurrenceFrequency;
  today: string;
  lastGeneratedAt?: string;
  endDate?: string;
  maxOccurrences?: number;
}): string[] {
  const {
    startDate,
    frequency,
    today,
    lastGeneratedAt,
    endDate,
    maxOccurrences = 366,
  } = options;

  if (startDate > today) {
    return [];
  }

  let cursor = lastGeneratedAt
    ? addFrequency(lastGeneratedAt, frequency)
    : startDate;

  const dueDates: string[] = [];

  while (cursor <= today && dueDates.length < maxOccurrences) {
    if (endDate && cursor > endDate) {
      break;
    }

    if (cursor >= startDate) {
      dueDates.push(cursor);
    }

    cursor = addFrequency(cursor, frequency);
  }

  return dueDates;
}

/** Prochaine date après `isoDate` selon la fréquence. */
export function addFrequency(isoDate: string, frequency: RecurrenceFrequency): string {
  const date = parseIsoDate(isoDate);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      addMonthsClamped(date, 1);
      break;
    case 'yearly':
      addMonthsClamped(date, 12);
      break;
  }

  return formatIsoDate(date);
}

function addMonthsClamped(date: Date, months: number): void {
  const dayOfMonth = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(dayOfMonth, lastDayOfMonth));
}

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIsoDate(): string {
  return formatIsoDate(new Date());
}
