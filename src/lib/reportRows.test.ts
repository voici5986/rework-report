import { describe, expect, it } from 'vitest';
import {
  createEmptyReworkRow,
  createInitialReportRows,
  ensureUniqueReworkRowIds,
  hasReworkRowData,
  MAX_REPORT_ROW_COUNT,
  MIN_REPORT_ROW_COUNT,
  normalizeReportRowCount,
  resizeReportRows,
} from './reportRows';

describe('report row sizing', () => {
  it('creates the requested number of independent initial rows', () => {
    const rows = createInitialReportRows(3);

    expect(rows).toHaveLength(3);
    expect(new Set(rows.map((row) => row.id))).toHaveLength(3);
    expect(rows.every((row) => !hasReworkRowData(row))).toBe(true);
  });

  it('repairs IDs without changing the number of rows', () => {
    const rows = Array.from({ length: MAX_REPORT_ROW_COUNT + 1 }, () =>
      createEmptyReworkRow('duplicate'),
    );

    const normalized = ensureUniqueReworkRowIds(rows);

    expect(normalized).toHaveLength(MAX_REPORT_ROW_COUNT + 1);
    expect(new Set(normalized.map((row) => row.id))).toHaveLength(
      MAX_REPORT_ROW_COUNT + 1,
    );
  });

  it('adds independent blank days while preserving existing data', () => {
    const first = createEmptyReworkRow('existing');
    first.workers = 12;

    const resized = resizeReportRows([first], 3);

    expect(resized).toHaveLength(3);
    expect(resized[0]).toBe(first);
    expect(resized[1]).toMatchObject({ date: '', workers: 0 });
    expect(resized[2]).toMatchObject({ date: '', workers: 0 });
    expect(new Set(resized.map((row) => row.id))).toHaveLength(3);
  });

  it('repairs duplicate or empty IDs before resizing', () => {
    const rows = [
      createEmptyReworkRow('duplicate'),
      createEmptyReworkRow('duplicate'),
      createEmptyReworkRow('   '),
    ];

    const resized = resizeReportRows(rows, 4);

    expect(resized).toHaveLength(4);
    expect(resized[0].id).toBe('duplicate');
    expect(new Set(resized.map((row) => row.id))).toHaveLength(4);
    expect(resized.every((row) => row.id.trim() !== '')).toBe(true);
  });

  it('removes days only from the end', () => {
    const rows = [
      createEmptyReworkRow('first'),
      createEmptyReworkRow('second'),
      createEmptyReworkRow('third'),
    ];

    expect(resizeReportRows(rows, 2)).toEqual(rows.slice(0, 2));
  });

  it('keeps requested counts within the supported range', () => {
    expect(normalizeReportRowCount(0)).toBe(MIN_REPORT_ROW_COUNT);
    expect(normalizeReportRowCount(12.8)).toBe(12);
    expect(normalizeReportRowCount(10_000)).toBe(MAX_REPORT_ROW_COUNT);
  });

  it('detects whether a day contains user-entered data', () => {
    const empty = createEmptyReworkRow('empty');
    const filled = { ...empty, date: '2026-08-29' };

    expect(hasReworkRowData(empty)).toBe(false);
    expect(hasReworkRowData(filled)).toBe(true);
  });
});
