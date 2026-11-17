import { ITariff } from 'types/billing';
import api from 'utils/api';

function getTarifElement({
  startAt,
  endAt,
  rate,
  rateWithoutQqs
}: {
  startAt: string | Date;
  endAt: string | Date;
  rate: number;
  rateWithoutQqs: number;
}) {
  const withQQS = rate - rateWithoutQqs;
  startAt = new Date(startAt);
  endAt = endAt ? new Date(endAt) : new Date();
  let month = startAt.getMonth();
  let year = startAt.getFullYear();
  let result = [];
  for (let i = 0; !((month > endAt.getMonth() && year === endAt.getFullYear()) || year > endAt.getFullYear()); i++) {
    result.push({
      month: month + 1,
      year: year,
      hisoblandi: rate,
      withQQS: withQQS
    });
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
  }
  return result;
}

export async function getTariffs(): Promise<ITariff[]> {
  let result: ITariff[] = [
    {
      month: 1,
      year: 2019,
      hisoblandi: 2000,
      withQQS: 2000
    }
  ];
  try {
    const res = await api.get('/billing/get-tariffs', { headers: { 'hide-error': 'true' } });
    const tariffs = res.data?.tariffs || [];
    for (let tariff of tariffs) {
      result.push(...getTarifElement(tariff).filter((row) => result.find((r) => r.month == row.month && r.year == row.year) == undefined));
    }
  } catch (err) {
    console.warn('getTariffs: API dan tariflarni olishda xatolik, standart qiymat qaytariladi:', err);
    result.push({
      month: 1,
      year: 2024,
      hisoblandi: 4000,
      withQQS: 4000
    });
  }
  return result;
}
