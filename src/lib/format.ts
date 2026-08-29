const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function money(value: number): string {
  return `฿${Math.round(value).toLocaleString('en-US')}`;
}

export function numberText(value: number): string {
  return value.toLocaleString('en-US');
}

export function normalizeNonNegativeNumber(value: string): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function percent(part: number, total: number): number {
  return total ? (part / total) * 100 : 0;
}

export function formatDateInput(value: string): string {
  return value.replaceAll('-', '/');
}

export function normalizeDateInput(value: string, fallback: string): string {
  const raw = String(value || '')
    .trim()
    .replace(/[.-]/g, '/');
  const parts = raw.split('/').filter(Boolean).map(Number);
  let year: number;
  let month: number;
  let day: number;

  if (parts.length === 3) {
    [year, month, day] = parts;
  } else if (parts.length === 2) {
    year =
      Number(String(fallback || '').slice(0, 4)) || new Date().getFullYear();
    [month, day] = parts;
  } else {
    return fallback;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return fallback;
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function weekday(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
}

export function periodText(dates: string[]): string {
  const validDates = dates.filter(
    (date) => date !== '' && normalizeDateInput(date, '') === date,
  );
  if (validDates.length === 0) return '—';
  const sorted = [...validDates].sort();
  const firstDate = sorted[0];
  const lastDate = sorted.at(-1) ?? firstDate;
  const [firstYear] = firstDate.split('-');
  const [lastYear, lastMonth, lastDay] = lastDate.split('-');
  const last =
    firstYear === lastYear
      ? `${lastMonth}/${lastDay}`
      : formatDateInput(lastDate);
  return `${formatDateInput(firstDate)} – ${last}`;
}
