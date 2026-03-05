import { aktType, dhjRow, IHisoblandiItem } from 'views/billing/CreateAbonentPetition.jsx/useStore';

export const calculateRevaluation = ({
  fromMoon,
  fromYear,
  toMoon,
  toYear,
  yashovchilar = 1,
  hisoblandiJadval = []
}: {
  fromMoon: number;
  fromYear: number;
  toMoon: number;
  toYear: number;
  yashovchilar?: number;
  hisoblandiJadval?: IHisoblandiItem[];
}) => {
  // TODO: aniqlik va moslikni oshirish uchun TozaMakon hisoblash uskunalaridan foydalanish lozim, hozircha classic uslubdan foydalanamiz
  let totalSumm = 0;
  let totalWithQQS = 0;
  // 1. Standart holat uchun hisoblash
  hisoblandiJadval.forEach((davr) => {
    const isAfterStart = davr.year > fromYear || (davr.year === fromYear && davr.month - 1 >= fromMoon);
    const isBeforeEnd = davr.year < toYear || (davr.year === toYear && davr.month - 1 <= toMoon);

    if (isAfterStart && isBeforeEnd) {
      const amount = davr.hisoblandi * yashovchilar;
      if (davr.withQQS) {
        totalWithQQS += amount;
      }
      totalSumm += amount;
    }
  });

  return {
    summ: totalSumm,
    withQQS: totalWithQQS
  };
};
