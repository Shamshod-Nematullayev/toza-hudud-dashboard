import dayjs, { Dayjs } from 'dayjs';
import { ITariff } from 'types/billing';
import { periodMonthRange } from '../../CreateAbonentPetition.jsx/useStore';

export interface MonthlyTariffBreakdownItem {
  year: number;
  fromMonth: number;
  toMonth: number;
  monthsCount: number;
  rate: number;
  withQQS: number;
  subtotal: number;
}

export interface CalculationAuditResult {
  total: number;
  totalWithQQS: number;
  totalWithoutQQS: number;
  monthsCount: number;
  items: MonthlyTariffBreakdownItem[];
  formulaSummary: string;
}

/**
 * Berilgan sana oralig'i va yashovchilar soni bo'yicha rasmiy tariflar asosida oylik taqsimot va summani hisoblaydi
 */
export function calculateTariffBreakdown(
  startDate: string | Date | Dayjs,
  endDate: string | Date | Dayjs,
  inhabitantCount: number = 1,
  tariffs: ITariff[] = []
): CalculationAuditResult {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid() || inhabitantCount === 0) {
    return {
      total: 0,
      totalWithQQS: 0,
      totalWithoutQQS: 0,
      monthsCount: 0,
      items: [],
      formulaSummary: 'Davr noto‘g‘ri kiritilgan'
    };
  }

  // Hisoblash qoidasi: agar sana 15-kundan keyin bo'lsa, keyingi oydan boshlanadi
  const fromMonthDate = (start.date() > 15 ? start.add(1, 'month') : start).startOf('month');
  const toMonthDate = (end.date() > 15 ? end : end.subtract(1, 'month')).startOf('month');

  if (fromMonthDate.isAfter(toMonthDate)) {
    return {
      total: 0,
      totalWithQQS: 0,
      totalWithoutQQS: 0,
      monthsCount: 0,
      items: [],
      formulaSummary: '0 oy (qamrov mavjud emas)'
    };
  }

  // Oyma-oy yig'ish
  let curr = fromMonthDate;
  const monthList: { year: number; month: number; rate: number; withQQS: number }[] = [];

  while (curr.isBefore(toMonthDate) || curr.isSame(toMonthDate, 'month')) {
    const y = curr.year();
    const m = curr.month() + 1;

    // Ro'yxatdan tarifni topish
    const foundTariff = tariffs.find((t) => t.year === y && t.month === m);
    // Standart fallback tariflar agar API da bo'lmasa
    let rate = 4000;
    let withQQS = 4000;
    if (foundTariff) {
      rate = foundTariff.hisoblandi || 4000;
      withQQS = foundTariff.withQQS || rate;
    } else if (y < 2021) {
      rate = 2000;
      withQQS = 2000;
    } else if (y < 2023) {
      rate = 2600;
      withQQS = 2600;
    } else if (y === 2023) {
      rate = 3500;
      withQQS = 3500;
    } else {
      rate = 4000;
      withQQS = 4000;
    }

    monthList.push({ year: y, month: m, rate, withQQS });
    curr = curr.add(1, 'month');
  }

  // Guruhlarga (yillar va tariflar kesimida) ajratish
  const items: MonthlyTariffBreakdownItem[] = [];
  let currentGroup: MonthlyTariffBreakdownItem | null = null;

  for (const mItem of monthList) {
    if (!currentGroup) {
      currentGroup = {
        year: mItem.year,
        fromMonth: mItem.month,
        toMonth: mItem.month,
        monthsCount: 1,
        rate: mItem.rate,
        withQQS: mItem.withQQS,
        subtotal: mItem.rate * inhabitantCount
      };
    } else if (currentGroup.year === mItem.year && currentGroup.rate === mItem.rate) {
      currentGroup.toMonth = mItem.month;
      currentGroup.monthsCount += 1;
      currentGroup.subtotal += mItem.rate * inhabitantCount;
    } else {
      items.push(currentGroup);
      currentGroup = {
        year: mItem.year,
        fromMonth: mItem.month,
        toMonth: mItem.month,
        monthsCount: 1,
        rate: mItem.rate,
        withQQS: mItem.withQQS,
        subtotal: mItem.rate * inhabitantCount
      };
    }
  }

  if (currentGroup) {
    items.push(currentGroup);
  }

  let total = 0;
  let totalWithQQS = 0;
  for (const mItem of monthList) {
    total += mItem.rate * inhabitantCount;
    totalWithQQS += mItem.withQQS * inhabitantCount;
  }

  const formulaParts = items.map((it) => {
    const monthSpan =
      it.fromMonth === it.toMonth
        ? `${String(it.fromMonth).padStart(2, '0')}-oy`
        : `${String(it.fromMonth).padStart(2, '0')}-${String(it.toMonth).padStart(2, '0')} oylar`;
    return `${it.year}-yil (${monthSpan}, ${it.monthsCount} oy): ${it.monthsCount} × ${it.rate.toLocaleString()} so'm × ${inhabitantCount} kishi = ${it.subtotal.toLocaleString()} so'm`;
  });

  return {
    total,
    totalWithQQS,
    totalWithoutQQS: total - totalWithQQS,
    monthsCount: monthList.length,
    items,
    formulaSummary: formulaParts.join(' + ')
  };
}

/**
 * Ariza qayta hisobi nega bunday bo'lganligi haqida insoniy tushunarli matn
 */
export function explainCalculationReason(ariza: any): {
  headline: string;
  badgeLabel: string;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  details: string;
} {
  if (!ariza) {
    return {
      headline: 'Ariza ma’lumotlari mavjud emas',
      badgeLabel: 'Noma’lum',
      color: 'info',
      details: '—'
    };
  }

  const docType = ariza.document_type || '';
  const oldCnt = ariza.current_prescribed_cnt ?? '—';
  const newCnt = ariza.next_prescribed_cnt ?? '—';

  switch (docType) {
    case 'vafot':
      return {
        headline: 'Yashovchi vafot etganligi munosabati bilan qayta hisob',
        badgeLabel: 'Vafot etganlik',
        color: 'secondary',
        details: `Tegishli davrdan boshlab vafot etgan fuqaro ro‘yxatdan chiqarilib, yashovchilar soni ${oldCnt} kishidan ${newCnt} kishiga kamaytirilgan.`
      };
    case 'viza':
      return {
        headline: 'Fuqaroning xorijga ketganligi (viza/xorijiy pasport) asosida',
        badgeLabel: 'Viza / Chet el',
        color: 'info',
        details: `Fuqaroning chet elda bo‘lgan davri uchun chiqindi xizmati hisob-kitobi to‘xtatilgan yoki qayta hisob kiritilgan.`
      };
    case 'odam_soni':
      return {
        headline: 'Aholi soni o‘zgarishi (kamayishi yoki ko‘payishi) bo‘yicha qayta hisob',
        badgeLabel: 'Odam soni',
        color: 'primary',
        details: `Xonadondagi ro‘yxatda turuvchilar soni ${oldCnt} kishidan ${newCnt} kishiga o‘zgarganligi munosabati bilan davrlar bo‘yicha qarz/ortiqcha to‘lov qayta hisoblangan.`
      };
    case 'pul_kuchirish':
    case 'tulov_kuchirish':
      return {
        headline: 'To‘lovni bir hisob raqamdan boshqasiga ko‘chirish',
        badgeLabel: 'Pul ko‘chirish',
        color: 'warning',
        details: `Abonent tomonidan yanglish to‘langan mablag‘ asosiy hisob raqamdan ikkilamchi to‘g‘ri hisob raqamga o‘tkazilgan.`
      };
    case 'yashovchi_kuchirish':
      return {
        headline: 'Yashovchini bir hisobdan ikkinchisiga ko‘chirish',
        badgeLabel: 'Yashovchi ko‘chirish',
        color: 'warning',
        details: `Abonentlar o‘rtasida yashovchilar taqsimoti va ularga tegishli hisob-kitob ko‘chirilgan.`
      };
    case 'dvaynik':
      return {
        headline: 'Dublikat (bir xil manzil bo‘yicha ikkilamchi hisob) bartaraf etilgan',
        badgeLabel: 'Dublikat hisob',
        color: 'error',
        details: `Bitta ko‘chmas mulkka ochilgan ortiqcha hisob raqam aniqlanib, hisob-kitoblar birlashtirilgan yoki bekor qilingan.`
      };
    case 'gps':
      return {
        headline: 'GPS / Xizmat ko‘rsatilmaganligi dalolatnomasi',
        badgeLabel: 'GPS dalolatnoma',
        color: 'info',
        details: `Chiqindi tashuvchi maxsus texnika harakati (GPS treki) xizmat ko‘rsatmagan davrlar aniqlanib, abonent foydasiga qayta hisoblangan.`
      };
    default:
      return {
        headline: 'Dalolatnoma va murojaat asosida qayta hisob',
        badgeLabel: docType || 'Qayta hisob',
        color: 'primary',
        details: `Abonent arizasi va tasdiqlovchi hujjatlar asosida qayta hisob kiritilgan.`
      };
  }
}

/**
 * Period oralig'i matnini chiqarish
 */
export function formatPeriodRange(period: any): string {
  if (!period) return '—';
  const range = periodMonthRange(period);
  if (!range) {
    const s = period.startDate ? dayjs(period.startDate).format('DD.MM.YYYY') : '';
    const e = period.endDate ? dayjs(period.endDate).format('DD.MM.YYYY') : '';
    return s && e ? `${s} — ${e}` : '—';
  }
  const fromStr = range.from.format('MM.YYYY');
  const toStr = range.to.format('MM.YYYY');
  const monthsDiff = range.to.diff(range.from, 'month') + 1;
  return `${fromStr} — ${toStr} (${monthsDiff} oy)`;
}
