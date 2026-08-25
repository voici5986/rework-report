import { DEFAULT_REPORT } from '../data/defaultReport';
import type { ReportState } from '../types/report';

export const STORAGE_KEY = 'cw-rework-report-v1';

function cloneDefault(): ReportState {
  return structuredClone(DEFAULT_REPORT);
}

export function loadReport(): ReportState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<ReportState> | null;
    if (saved && Array.isArray(saved.rows)) {
      return {
        ...cloneDefault(),
        ...saved,
        rates: {
          ...DEFAULT_REPORT.rates,
          ...saved.rates,
        },
        rows: saved.rows.map((row, index) => ({
          ...DEFAULT_REPORT.rows[index] ?? DEFAULT_REPORT.rows[0],
          ...row,
          id: row.id ?? `${row.date ?? 'row'}-${index}`,
        })),
      };
    }
  } catch {
    // Ignore malformed local data and fall back to defaults.
  }
  return cloneDefault();
}

export function saveReport(report: ReportState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
}

export function resetReport(): ReportState {
  const report = cloneDefault();
  saveReport(report);
  return report;
}
