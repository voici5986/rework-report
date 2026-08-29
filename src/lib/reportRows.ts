import type { ReworkRow } from '../types/report';

export const MIN_REPORT_ROW_COUNT = 1;
export const MAX_REPORT_ROW_COUNT = 366;

export function createEmptyReworkRow(id: string): ReworkRow {
  return {
    id,
    date: '',
    workers: 0,
    normalHours: 0,
    otHours: 0,
    supervisorPeople: 0,
    supervisorHours: 0,
  };
}

export function createInitialReportRows(count: number): ReworkRow[] {
  const rowCount = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  return Array.from({ length: rowCount }, (_, index) =>
    createEmptyReworkRow(`empty-row-${index + 1}`),
  );
}

export function normalizeReportRowCount(value: number): number {
  if (!Number.isFinite(value)) return MIN_REPORT_ROW_COUNT;
  return Math.min(
    MAX_REPORT_ROW_COUNT,
    Math.max(MIN_REPORT_ROW_COUNT, Math.trunc(value)),
  );
}

export function resizeReportRows(
  rows: ReworkRow[],
  requestedCount: number,
): ReworkRow[] {
  const count = normalizeReportRowCount(requestedCount);
  const sizedRows = count < rows.length ? rows.slice(0, count) : rows;
  const uniqueRows = ensureUniqueReworkRowIds(sizedRows);
  if (count === uniqueRows.length) return uniqueRows;

  const resized = [...uniqueRows];
  const usedIds = new Set(uniqueRows.map((row) => row.id));

  while (resized.length < count) {
    const id = nextAvailableRowId(usedIds);
    usedIds.add(id);
    resized.push(createEmptyReworkRow(id));
  }

  return resized;
}

export function ensureUniqueReworkRowIds(rows: ReworkRow[]): ReworkRow[] {
  const usedIds = new Set<string>();
  let changed = false;
  const normalized = rows.map((row) => {
    if (
      typeof row.id === 'string' &&
      row.id.trim() !== '' &&
      !usedIds.has(row.id)
    ) {
      usedIds.add(row.id);
      return row;
    }

    const id = nextAvailableRowId(usedIds);
    usedIds.add(id);
    changed = true;
    return { ...row, id };
  });

  return changed ? normalized : rows;
}

function nextAvailableRowId(usedIds: Set<string>): string {
  let suffix = 1;
  while (usedIds.has(`empty-row-${suffix}`)) suffix += 1;
  return `empty-row-${suffix}`;
}

export function hasReworkRowData(row: ReworkRow): boolean {
  return (
    row.date.trim() !== '' ||
    row.workers !== 0 ||
    row.normalHours !== 0 ||
    row.otHours !== 0 ||
    row.supervisorPeople !== 0 ||
    row.supervisorHours !== 0
  );
}
