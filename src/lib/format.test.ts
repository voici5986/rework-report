import { describe, expect, it } from 'vitest';
import {
  normalizeDateInput,
  normalizeNonNegativeNumber,
  percent,
  periodText,
  weekday,
} from './format';

describe('normalizeNonNegativeNumber', () => {
  it('accepts valid values and clamps negative or non-finite input', () => {
    expect(normalizeNonNegativeNumber('12.5')).toBe(12.5);
    expect(normalizeNonNegativeNumber('-5')).toBe(0);
    expect(normalizeNonNegativeNumber('1e309')).toBe(0);
    expect(normalizeNonNegativeNumber('')).toBe(0);
  });
});

describe('normalizeDateInput', () => {
  it('normalizes supported separators and zero-pads month and day', () => {
    expect(normalizeDateInput('2026.8-9', '')).toBe('2026-08-09');
  });

  it('uses the fallback year for a month/day input', () => {
    expect(normalizeDateInput('8/30', '2025-01-01')).toBe('2025-08-30');
  });

  it('keeps the fallback when the date is invalid', () => {
    expect(normalizeDateInput('2026/02/30', '2026-02-28')).toBe('2026-02-28');
  });
});

describe('date summaries', () => {
  it('reports the weekday for a valid date', () => {
    expect(weekday('2026-08-29')).toBe('周六');
  });

  it('sorts valid dates and ignores blank, malformed, or impossible dates', () => {
    expect(
      periodText(['', '2026-08-30', 'bad', '2026-99-99', '2026-08-29']),
    ).toBe('2026/08/29 – 08/30');
  });

  it('uses a dash when there are no valid dates', () => {
    expect(periodText(['', 'bad', '2026-02-30'])).toBe('—');
  });

  it('includes both years when the reporting period crosses a year boundary', () => {
    expect(periodText(['2026-12-28', '2027-01-03'])).toBe(
      '2026/12/28 – 2027/01/03',
    );
  });
});

describe('percent', () => {
  it('does not produce NaN when the total is zero', () => {
    expect(percent(10, 0)).toBe(0);
  });
});
