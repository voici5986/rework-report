import { DEFAULT_REPORT } from '../data/defaultReport';
import type { ReportState, ReworkRow, WageRates } from '../types/report';
import {
  createEmptyReworkRow,
  createInitialReportRows,
  ensureUniqueReworkRowIds,
  MIN_REPORT_ROW_COUNT,
} from './reportRows';

export const STORAGE_KEY = 'cw-rework-report-v1';

function cloneDefault(): ReportState {
  return structuredClone(DEFAULT_REPORT);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readNonNegativeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function normalizeRates(value: unknown): WageRates {
  const rates = isRecord(value) ? value : {};
  return {
    normal: readNonNegativeNumber(rates.normal),
    ot: readNonNegativeNumber(rates.ot),
    supervisor: readNonNegativeNumber(rates.supervisor),
  };
}

function normalizeRow(value: unknown, index: number): ReworkRow {
  const fallback =
    DEFAULT_REPORT.rows[index] ??
    createEmptyReworkRow(`cached-row-${index + 1}`);
  if (!isRecord(value)) return { ...fallback };

  const date = readText(value.date, fallback.date);
  return {
    id: readText(value.id).trim() || `${date || 'row'}-${index}`,
    date,
    workers: readNonNegativeNumber(value.workers, fallback.workers),
    normalHours: readNonNegativeNumber(value.normalHours, fallback.normalHours),
    otHours: readNonNegativeNumber(value.otHours, fallback.otHours),
    supervisorPeople: readNonNegativeNumber(
      value.supervisorPeople,
      fallback.supervisorPeople,
    ),
    supervisorHours: readNonNegativeNumber(
      value.supervisorHours,
      fallback.supervisorHours,
    ),
  };
}

export function loadReport(): ReportState {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? 'null',
    );
    if (isRecord(saved)) {
      const cachedRows = Array.isArray(saved.rows)
        ? saved.rows
        : cloneDefault().rows;
      const rows = cachedRows.map(normalizeRow);
      return {
        projectName: readText(saved.projectName),
        reportTitle: readText(saved.reportTitle),
        subtitle: readText(saved.subtitle),
        rates: normalizeRates(saved.rates),
        rows: ensureUniqueReworkRowIds(
          rows.length === 0
            ? createInitialReportRows(MIN_REPORT_ROW_COUNT)
            : rows,
        ),
      };
    }
  } catch {
    // Ignore malformed local data and fall back to a blank report.
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
