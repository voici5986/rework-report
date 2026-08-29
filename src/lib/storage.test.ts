import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from '../test/MemoryStorage';
import { MAX_REPORT_ROW_COUNT } from './reportRows';
import { loadReport, resetReport, STORAGE_KEY, saveReport } from './storage';

describe('report storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts a new browser with an independent blank report', () => {
    const first = loadReport();

    expect(first).toMatchObject({
      projectName: '',
      reportTitle: '',
      subtitle: '',
      rates: { normal: 0, ot: 0, supervisor: 0 },
    });
    expect(first.rows).toHaveLength(5);
    expect(
      first.rows.every(
        (row) =>
          row.date === '' &&
          row.workers === 0 &&
          row.normalHours === 0 &&
          row.otHours === 0 &&
          row.supervisorPeople === 0 &&
          row.supervisorHours === 0,
      ),
    ).toBe(true);

    first.rows[0].workers = 99;
    expect(loadReport().rows[0].workers).toBe(0);
  });

  it('saves and restores user-entered report data', () => {
    const report = loadReport();
    report.projectName = '缓存验证项目';
    report.rates.normal = 50;
    report.rows[0] = {
      id: 'row-1',
      date: '2026-08-29',
      workers: 12,
      normalHours: 3,
      otHours: 1,
      supervisorPeople: 1,
      supervisorHours: 4,
    };

    saveReport(report);

    expect(loadReport()).toEqual(report);
  });

  it('fills missing cached fields with blank values rather than sample data', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        projectName: '部分缓存',
        rates: { normal: 50 },
        rows: [{ date: '2026-08-29', workers: 12 }],
      }),
    );

    expect(loadReport()).toEqual({
      projectName: '部分缓存',
      reportTitle: '',
      subtitle: '',
      rates: { normal: 50, ot: 0, supervisor: 0 },
      rows: [
        {
          id: '2026-08-29-0',
          date: '2026-08-29',
          workers: 12,
          normalHours: 0,
          otHours: 0,
          supervisorPeople: 0,
          supervisorHours: 0,
        },
      ],
    });
  });

  it('falls back to a blank report when cached JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');

    const report = loadReport();

    expect(report.projectName).toBe('');
    expect(report.rates).toEqual({ normal: 0, ot: 0, supervisor: 0 });
    expect(report.rows).toHaveLength(5);
  });

  it('isolates a malformed row without discarding the rest of the cache', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        projectName: '保留项目',
        rates: { normal: 50 },
        rows: [
          {
            id: 'valid-row',
            date: '2026-08-29',
            workers: 12,
            normalHours: 3,
          },
          null,
        ],
      }),
    );

    const report = loadReport();

    expect(report.projectName).toBe('保留项目');
    expect(report.rates).toEqual({ normal: 50, ot: 0, supervisor: 0 });
    expect(report.rows).toHaveLength(2);
    expect(report.rows[0]).toMatchObject({
      id: 'valid-row',
      workers: 12,
      normalHours: 3,
    });
    expect(report.rows[1]).toMatchObject({
      date: '',
      workers: 0,
      normalHours: 0,
      otHours: 0,
      supervisorPeople: 0,
      supervisorHours: 0,
    });
  });

  it('cleans invalid negative or non-numeric cached amounts', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rates: { normal: -50, ot: 'bad', supervisor: 250 },
        rows: [{ workers: -12, normalHours: '3', supervisorPeople: 1 }],
      }),
    );

    const report = loadReport();

    expect(report.rates).toEqual({ normal: 0, ot: 0, supervisor: 250 });
    expect(report.rows[0]).toMatchObject({
      workers: 0,
      normalHours: 0,
      supervisorPeople: 1,
    });
  });

  it('normalizes an empty cached report to one editable day', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ projectName: '空行缓存', rows: [] }),
    );

    const report = loadReport();

    expect(report.projectName).toBe('空行缓存');
    expect(report.rows).toHaveLength(1);
  });

  it('preserves oversized cached reports and repairs duplicate IDs', () => {
    const rows = Array.from(
      { length: MAX_REPORT_ROW_COUNT + 4 },
      (_, index) => ({
        id: index < 2 ? 'duplicate' : `row-${index}`,
        date: '',
        workers: 0,
        normalHours: 0,
        otHours: 0,
        supervisorPeople: 0,
        supervisorHours: 0,
      }),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows }));

    const report = loadReport();

    expect(report.rows).toHaveLength(MAX_REPORT_ROW_COUNT + 4);
    expect(new Set(report.rows.map((row) => row.id))).toHaveLength(
      MAX_REPORT_ROW_COUNT + 4,
    );
  });

  it('resets both the returned state and persisted cache to a blank report', () => {
    const report = loadReport();
    report.projectName = '待清空项目';
    saveReport(report);

    const reset = resetReport();

    expect(reset.projectName).toBe('');
    expect(reset.rows).toHaveLength(5);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(
      reset,
    );
  });
});
