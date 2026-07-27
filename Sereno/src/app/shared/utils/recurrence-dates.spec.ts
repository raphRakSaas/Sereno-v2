import { describe, expect, it } from 'vitest';
import { addFrequency, listDueOccurrenceDates } from './recurrence-dates';

describe('addFrequency', () => {
  it('should advance by one day', () => {
    expect(addFrequency('2026-07-27', 'daily')).toBe('2026-07-28');
  });

  it('should advance by one week', () => {
    expect(addFrequency('2026-07-27', 'weekly')).toBe('2026-08-03');
  });

  it('should advance by one month and clamp end-of-month', () => {
    expect(addFrequency('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(addFrequency('2026-02-28', 'monthly')).toBe('2026-03-28');
  });

  it('should advance by one year', () => {
    expect(addFrequency('2024-02-29', 'yearly')).toBe('2025-02-28');
  });
});

describe('listDueOccurrenceDates', () => {
  it('should return startDate when never generated and start is today', () => {
    expect(
      listDueOccurrenceDates({
        startDate: '2026-07-27',
        frequency: 'monthly',
        today: '2026-07-27',
      }),
    ).toEqual(['2026-07-27']);
  });

  it('should return nothing when startDate is in the future', () => {
    expect(
      listDueOccurrenceDates({
        startDate: '2026-08-01',
        frequency: 'daily',
        today: '2026-07-27',
      }),
    ).toEqual([]);
  });

  it('should generate daily dates after lastGeneratedAt up to today', () => {
    expect(
      listDueOccurrenceDates({
        startDate: '2026-07-01',
        lastGeneratedAt: '2026-07-25',
        frequency: 'daily',
        today: '2026-07-27',
      }),
    ).toEqual(['2026-07-26', '2026-07-27']);
  });

  it('should generate weekly dates', () => {
    expect(
      listDueOccurrenceDates({
        startDate: '2026-07-01',
        lastGeneratedAt: '2026-07-01',
        frequency: 'weekly',
        today: '2026-07-22',
      }),
    ).toEqual(['2026-07-08', '2026-07-15', '2026-07-22']);
  });

  it('should generate monthly dates', () => {
    expect(
      listDueOccurrenceDates({
        startDate: '2026-01-05',
        lastGeneratedAt: '2026-01-05',
        frequency: 'monthly',
        today: '2026-04-10',
      }),
    ).toEqual(['2026-02-05', '2026-03-05', '2026-04-05']);
  });

  it('should stop at endDate', () => {
    expect(
      listDueOccurrenceDates({
        startDate: '2026-07-01',
        lastGeneratedAt: '2026-07-01',
        endDate: '2026-07-10',
        frequency: 'daily',
        today: '2026-07-20',
      }),
    ).toEqual([
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
      '2026-07-06',
      '2026-07-07',
      '2026-07-08',
      '2026-07-09',
      '2026-07-10',
    ]);
  });

  it('should respect maxOccurrences safety limit', () => {
    const dates = listDueOccurrenceDates({
      startDate: '2025-01-01',
      frequency: 'daily',
      today: '2026-07-27',
      maxOccurrences: 5,
    });
    expect(dates).toHaveLength(5);
  });
});
