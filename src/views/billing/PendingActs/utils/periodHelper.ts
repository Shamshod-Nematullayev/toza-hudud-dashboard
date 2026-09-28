import dayjs from 'dayjs';

export const MONTH_NAMES_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr'
];

/**
 * Returns current period key (YYYY-MM).
 * If today is >= 25th, period starts on this month's 25th (YYYY-MM).
 * If today is < 25th, period starts on previous month's 25th.
 */
export function getCurrentPendingPeriod(date = dayjs()): string {
  if (date.date() >= 25) {
    return date.format('YYYY-MM');
  }
  return date.subtract(1, 'month').format('YYYY-MM');
}

/**
 * Formats a period string like '2026-09' into human-friendly:
 * "Sentabr oxiri — Oktabr boshi (25.09 — 25.10.2026)"
 */
export function formatPendingPeriodLabel(periodStr: string): string {
  if (!periodStr) return '';
  const startMonth = dayjs(`${periodStr}-01`);
  const nextMonth = startMonth.add(1, 'month');

  const m1 = MONTH_NAMES_UZ[startMonth.month()] || startMonth.format('MMMM');
  const m2 = MONTH_NAMES_UZ[nextMonth.month()] || nextMonth.format('MMMM');
  const y = nextMonth.format('YYYY');

  return `${m1} oxiri — ${m2} boshi (25.${startMonth.format('MM')} — 25.${nextMonth.format('MM')}.${y})`;
}

/**
 * Returns fromDate & toDate ISO strings for API query
 */
export function getPendingPeriodRange(periodStr: string) {
  const startMonth = dayjs(`${periodStr}-01`);
  const fromDate = startMonth.date(25).startOf('day').toISOString();
  const toDate = startMonth.add(1, 'month').date(25).endOf('day').toISOString();
  return { fromDate, toDate };
}

/**
 * Generates options for the period picker
 */
export function getPeriodOptions(centerPeriod?: string, count = 12) {
  const base = centerPeriod ? dayjs(`${centerPeriod}-01`) : dayjs();
  const options = [];

  for (let i = 1; i >= -count; i--) {
    const d = base.add(i, 'month');
    const val = d.format('YYYY-MM');
    options.push({
      value: val,
      label: formatPendingPeriodLabel(val)
    });
  }

  return options;
}
