import React, { useEffect, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import {
  Grid,
  Button,
  Tooltip,
  Typography,
  Stack,
  Paper,
  Divider
} from '@mui/material';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getDhjFirstMonth, useStore } from '../../views/billing/CreateAbonentPetition.jsx/useStore.js';
import { toast } from 'react-toastify';
import api from 'utils/api.js';
import { useTranslation } from 'react-i18next';

dayjs.locale('uz-latn');

function RecalculatorAbonent() {
  const { t } = useTranslation();
  const {
    setAktSumma,
    recalculationPeriods,
    setRecalculationPeriods,
    aktType,
    rowsDhjTable,
    hisoblandiJadval,
    setHisoblandiJadval
  } = useStore();

  const [currentTotal, setCurrentTotal] = useState(0);
  const [withQQS, setWithQQS] = useState(0);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs().startOf('month'));

  // DHJ da yo'q davrni (abonent ochilishidan oldingi) qayta hisoblab bo'lmaydi: masalan abonent 01.05.2026 da ochilgan,
  // o'lim guvohnomasi esa 01.02.2026 ga — eng erta sana 01.05.2026, undan oldingisi xato bo'lib turadi
  const minDate = getDhjFirstMonth(rowsDhjTable) ?? dayjs('2019-01-01');
  const maxDate = dayjs();

  /** Xato bo'lsa toast ko'rsatadi va false qaytaradi */
  const checkDates = () => {
    if (!startDate?.isValid() || !endDate?.isValid()) {
      toast.error('Sanalarni kiriting');
      return false;
    }
    if (startDate.isBefore(minDate, 'day')) {
      toast.error(`Abonent DHJ si ${minDate.format('MM.YYYY')} dan boshlanadi: undan oldingi davrni qayta hisoblab bo'lmaydi`);
      return false;
    }
    if (endDate.isAfter(maxDate, 'day')) {
      toast.error("Tugash sanasi bugundan keyin bo'lishi mumkin emas");
      return false;
    }
    if (startDate.isAfter(endDate, 'day')) {
      toast.error("Boshlanish sanasi tugash sanasidan keyin bo'lishi mumkin emas");
      return false;
    }
    return true;
  };

  // Qayta hisoblash mantiqiy funksiyasi
  const qaytaHisob = ({
    fromMoon,
    fromYear,
    toMoon,
    toYear,
    yashovchilar = 1
  }: {
    fromMoon: number;
    fromYear: number;
    toMoon: number;
    toYear: number;
    yashovchilar?: number;
  }) => {
    if (aktType === 'gps') {
      let summ = 0;
      let withNdsSumm = 0;
      rowsDhjTable.forEach((row) => {
        const [oy, yil] = row.davr.split('.').map(Number);
        if (((oy - 1 >= fromMoon && yil == fromYear) || yil > fromYear) && ((oy - 1 <= toMoon && yil == toYear) || yil < toYear)) {
          const withQQS = hisoblandiJadval.find((r) => r.year == yil && r.month == oy)?.withQQS;
          if (withQQS) withNdsSumm += row.nachis;
          summ += row.nachis;
        }
      });
      setWithQQS(withNdsSumm);
      setCurrentTotal(summ);
      return;
    }

    let summ = 0;
    let withQQS = 0;
    for (let i = 0; i < hisoblandiJadval.length; i++) {
      const davr = hisoblandiJadval[i];
      if ((davr.year == fromYear && davr.month - 1 >= fromMoon) || davr.year > fromYear) {
        if (davr.year < toYear || (davr.year == toYear && davr.month - 1 <= toMoon)) {
          if (davr.withQQS) withQQS += davr.hisoblandi * yashovchilar;
          summ += davr.hisoblandi * yashovchilar;
        }
      }
    }
    setWithQQS(withQQS);
    setCurrentTotal(summ);
  };

  // recalculationPeriods o'zgarganda umumiy summani aktga o'rnatish
  useEffect(() => {
    let total = 0;
    let totalWithQQS = 0;
    let withoutQQSTotal = 0;
    recalculationPeriods.forEach((period) => {
      total += period.total;
      totalWithQQS += period.withQQSTotal;
      withoutQQSTotal += period.withoutQQSTotal;
    });
    setAktSumma({ total, totalWithQQS, withoutQQSTotal });
  }, [recalculationPeriods]);

  // Tariflarni API dan olish
  useEffect(() => {
    api.get('/billing/get-tariffs').then((res) => {
      const tariffs = res.data.tariffs;
      let result = [{ month: 1, year: 2019, hisoblandi: 2000, withQQS: 2000 }];
      for (let tariff of tariffs) {
        result.push(
          ...getTarifElement(tariff).filter((row) => result.find((r) => r.month == row.month && r.year == row.year) == undefined)
        );
      }
      setHisoblandiJadval(result.sort((r1, r2) => r1.year - r2.year || r1.month - r2.month));
    });
  }, []);

  // Sana o'zgarganda qayta hisoblash
  useEffect(() => {
    if (!startDate || !endDate) return;
    qaytaHisob({
      fromMoon: startDate.date() > 15 ? startDate.month() + 1 : startDate.month(),
      fromYear: startDate.year(),
      toMoon: +(endDate.date() > 15 ? endDate.month() : endDate.month() - 1),
      toYear: endDate.year()
    });
  }, [startDate, endDate]);

  // aktType o'zgarganda endDate ni oyning boshiga qaytarish
  useEffect(() => {
    setEndDate(dayjs().startOf('month'));
  }, [aktType]);

  // Minus (kreditor) tugmasi bosilganda
  const handleRemoveButtonClick = () => {
    if (!checkDates()) return;
    if (currentTotal === 0) return toast.info(t('recalculator.noValue'));
    const newEntry = {
      withQQSTotal: withQQS,
      withoutQQSTotal: currentTotal - withQQS,
      total: currentTotal,
      startDate,
      endDate,
      periodType: 'kreditor' as const,
      // Bitta kishilik summa: shu davrda 1 kishi kam hisoblanadi (GPS da kishi soni o'zgarmaydi)
      yashovchiDelta: aktType === 'gps' ? undefined : -1
    };
    if (aktType === 'gps') return setRecalculationPeriods([newEntry]);
    setRecalculationPeriods([...recalculationPeriods, newEntry]);
  };

  // Plus (debitor) tugmasi bosilganda
  const handleAddButtonClick = () => {
    if (!checkDates()) return;
    if (currentTotal === 0) return toast.info(t('recalculator.noValue'));
    const newEntry = {
      withQQSTotal: withQQS * -1,
      withoutQQSTotal: (currentTotal - withQQS) * -1,
      total: currentTotal * -1,
      startDate,
      endDate,
      periodType: 'debitor' as const,
      yashovchiDelta: aktType === 'gps' ? undefined : 1
    };
    if (aktType === 'gps') return setRecalculationPeriods([newEntry]);
    setRecalculationPeriods([...recalculationPeriods, newEntry]);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.25,
        backgroundColor: 'background.paper'
      }}
    >
      <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
        {/* Boshlanish va tugash sanalari */}
        <Grid size={{ xs: 12, sm: 6, md: 5.6 }} id="tour-recalc-dates">
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                views={['year', 'month', 'day']}
                minDate={minDate}
                maxDate={endDate?.isValid() && endDate.isBefore(maxDate) ? endDate : maxDate}
                label={t('recalculator.from')}
                format="DD.MM.YY"
                value={startDate}
                onChange={setStartDate}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      fontSize: '12px',
                      borderRadius: 1.5
                    }
                  },
                  openPickerIcon: { sx: { fontSize: '16px' } }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                views={['year', 'month', 'day']}
                minDate={startDate?.isValid() && startDate.isAfter(minDate) ? startDate : minDate}
                maxDate={maxDate}
                label={t('recalculator.to')}
                format="DD.MM.YY"
                value={endDate}
                onChange={setEndDate}
                disabled={aktType === 'death'}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      fontSize: '12px',
                      borderRadius: 1.5
                    }
                  },
                  openPickerIcon: { sx: { fontSize: '16px' } }
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Debitor / Kreditor tugmalari */}
        <Grid size={{ xs: 12, sm: 3.2, md: 3.4 }} id="tour-debitor-kreditor">
          <Stack direction="row" spacing={1}>
            <Tooltip title={`${t('recalculator.debitor')} — Qarz qo'shiladi (manfiy summa)`} arrow>
              <Button
                variant="contained"
                color="error"
                size="small"
                fullWidth
                onClick={handleAddButtonClick}
                startIcon={<TrendingDownIcon sx={{ fontSize: '15px' }} />}
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  py: 0.7,
                  boxShadow: 'none'
                }}
              >
                {t('recalculator.debitor')} (-)
              </Button>
            </Tooltip>

            <Tooltip title={`${t('recalculator.kreditor')} — Qarz kamayadi (musbat summa)`} arrow>
              <Button
                variant="contained"
                color="success"
                size="small"
                fullWidth
                onClick={handleRemoveButtonClick}
                startIcon={<TrendingUpIcon sx={{ fontSize: '15px' }} />}
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  py: 0.7,
                  boxShadow: 'none'
                }}
              >
                {t('recalculator.kreditor')} (+)
              </Button>
            </Tooltip>
          </Stack>
        </Grid>

        {/* Tanlangan davr summasi */}
        <Grid size={{ xs: 12, sm: 2.8, md: 3 }} id="tour-period-sum">
          <Paper
            elevation={0}
            sx={{
              backgroundColor: currentTotal !== 0 ? 'primary.50' : 'action.hover',
              border: '1px solid',
              borderColor: currentTotal !== 0 ? 'primary.200' : 'divider',
              borderRadius: 1.5,
              px: 1.2,
              py: 0.6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '9px', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {t('recalculator.periodSum') || 'Davr summasi'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px', color: currentTotal !== 0 ? 'primary.main' : 'text.disabled' }}>
              {currentTotal.toLocaleString()} so'm
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default RecalculatorAbonent;

// Tarif elementlarini generatsiya qilish
export function getTarifElement({
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
    result.push({ month: month + 1, year, hisoblandi: rate, withQQS });
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
  }

  return result;
}
