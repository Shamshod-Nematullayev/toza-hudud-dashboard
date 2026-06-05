import React, { useEffect, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import { Grid, IconButton, Button, Tooltip, Typography, Stack, Box, Chip, Paper, Divider } from '@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useStore } from '../../views/billing/CreateAbonentPetition.jsx/useStore.js';
import { toast } from 'react-toastify';
import { DataGrid } from '@mui/x-data-grid';
import { colors } from 'store/constant.js';
import api from 'utils/api.js';
import { useTranslation } from 'react-i18next';

dayjs.locale('uz-latn');

function RecalculatorAbonent() {
  const { t } = useTranslation();
  const { setAktSumma, recalculationPeriods, setRecalculationPeriods, aktType, rowsDhjTable, hisoblandiJadval, setHisoblandiJadval } =
    useStore();

  const [currentTotal, setCurrentTotal] = useState(0);
  const [withQQS, setWithQQS] = useState(0);
  const [totalSumm, setTotalSumm] = useState(0);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs().startOf('month'));

  // Qayta hisoblash mantiqiy funksiyasi — o'zgartirilmagan
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

  // Tariflarni API dan olish va hisoblandiJadval ni to'ldirish
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

  // Jadval satrlari o'zgarganda umumiy summani hisoblash
  useEffect(() => {
    let total = 0;
    recalculationPeriods.forEach((period) => {
      total += period.total;
    });
    setTotalSumm(total);
  }, [recalculationPeriods]);

  // aktType o'zgarganda endDate ni oyning boshiga qaytarish
  useEffect(() => {
    setEndDate(dayjs().startOf('month'));
  }, [aktType]);

  // Minus (kreditor) tugmasi bosilganda — joriy hisoblangan summani qo'shish
  const handleRemoveButtonClick = () => {
    if (currentTotal === 0) return toast.info(t('recalculator.noValue'));
    const newEntry = {
      withQQSTotal: withQQS,
      withoutQQSTotal: currentTotal - withQQS,
      total: currentTotal,
      startDate,
      endDate
    };
    if (aktType === 'gps') return setRecalculationPeriods([newEntry]);
    setRecalculationPeriods([...recalculationPeriods, newEntry]);
  };

  // Plus (debitor) tugmasi bosilganda — joriy summani manfiy qilib qo'shish
  const handleAddButtonClick = () => {
    if (currentTotal === 0) return toast.info(t('recalculator.noValue'));
    const newEntry = {
      withQQSTotal: withQQS * -1,
      withoutQQSTotal: (currentTotal - withQQS) * -1,
      total: currentTotal * -1,
      startDate,
      endDate
    };
    if (aktType === 'gps') return setRecalculationPeriods([newEntry]);
    setRecalculationPeriods([...recalculationPeriods, newEntry]);
  };

  // Jadvaldan yozuvni o'chirish
  const deleteItem = (index: number) => {
    setRecalculationPeriods(recalculationPeriods.filter((_, i) => i !== index));
  };

  const isPositiveTotal = totalSumm >= 0;

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5, pt: 1 }}>
      {/* Yuqori panel: sana tanlash + amallar + joriy summa */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 1.5,
          backgroundColor: 'background.paper'
        }}
      >
        <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
          {/* Boshlanish sanasi */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <DatePicker
              views={['year', 'month', 'day']}
              minDate={dayjs('2019-01-01')}
              maxDate={dayjs()}
              label={t('recalculator.from')}
              format="DD.MM.YY"
              value={startDate}
              onChange={setStartDate}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: {
                    fontSize: '13px',
                    borderRadius: 1.5
                  }
                },
                openPickerIcon: { sx: { fontSize: '18px' } }
              }}
            />
          </Grid>

          {/* Tugash sanasi */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <DatePicker
              views={['year', 'month', 'day']}
              minDate={dayjs('2019-01-01')}
              maxDate={dayjs()}
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
                    fontSize: '13px',
                    borderRadius: 1.5
                  }
                },
                openPickerIcon: { sx: { fontSize: '18px' } }
              }}
            />
          </Grid>

          {/* Debitor / Kreditor tugmalari */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <Stack direction="column" spacing={1}>
              <Tooltip title={t('recalculator.debitor')} arrow>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleAddButtonClick}
                  startIcon={<TrendingUpIcon sx={{ fontSize: '16px' }} />}
                  sx={{
                    flex: 1,
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    py: 0.8,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 2px 8px rgba(211,47,47,0.3)' }
                  }}
                >
                  {t('recalculator.debitor')}
                </Button>
              </Tooltip>

              <Tooltip title={t('recalculator.kreditor')} arrow>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleRemoveButtonClick}
                  startIcon={<TrendingDownIcon sx={{ fontSize: '16px' }} />}
                  sx={{
                    flex: 1,
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    py: 0.8,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 2px 8px rgba(46,125,50,0.3)' }
                  }}
                >
                  {t('recalculator.kreditor')}
                </Button>
              </Tooltip>
            </Stack>
          </Grid>

          {/* Joriy va umumiy summalar */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: currentTotal !== 0 ? 'primary.50' : 'action.hover',
                border: '1px solid',
                borderColor: currentTotal !== 0 ? 'primary.200' : 'divider',
                borderRadius: 1.5,
                px: 1.5,
                py: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '10px', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {t('recalculator.periodSum') || 'Davr summasi'}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: currentTotal !== 0 ? 'primary.main' : 'text.disabled'
                }}
              >
                {currentTotal.toLocaleString()}
              </Typography>

              <Divider sx={{ my: 0.5 }} />

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '10px', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {t('recalculator.total')}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: isPositiveTotal ? 'success.main' : 'error.main'
                }}
              >
                {totalSumm.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Yozuvlar jadvali */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          columns={[
            {
              field: 'id',
              headerName: '№',
              width: 48,
              sortable: false,
              renderCell: ({ value }) => (
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {value}
                </Typography>
              )
            },
            {
              field: 'startDate',
              headerName: t('recalculator.periodFrom'),
              flex: 1,
              sortable: false,
              renderCell: ({ value }) => (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ fontSize: '12px', color: 'text.disabled' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px' }}>
                    {value}
                  </Typography>
                </Stack>
              )
            },
            {
              field: 'endDate',
              headerName: t('recalculator.periodTo'),
              flex: 1,
              sortable: false,
              renderCell: ({ value }) => (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ fontSize: '12px', color: 'text.disabled' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px' }}>
                    {value}
                  </Typography>
                </Stack>
              )
            },
            {
              field: 'total',
              headerName: t('recalculator.sum'),
              flex: 1,
              sortable: false,
              renderCell: ({ value }) => (
                <Chip
                  label={Number(value).toLocaleString()}
                  size="small"
                  color={value < 0 ? 'error' : 'success'}
                  variant="outlined"
                  sx={{ fontWeight: 700, fontSize: '12px', height: '24px', bgcolor: 'black' }}
                />
              )
            },
            {
              field: 'actions',
              headerName: '',
              width: 52,
              sortable: false,
              renderCell: ({ row }) => (
                <Tooltip title={t('recalculator.actions') || "O'chirish"} arrow>
                  <IconButton
                    size="small"
                    onClick={() => deleteItem(row.id - 1)}
                    sx={{
                      color: 'text.disabled',
                      '&:hover': { color: 'error.main', backgroundColor: 'error.50' },
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: '17px' }} />
                  </IconButton>
                </Tooltip>
              )
            }
          ]}
          rows={recalculationPeriods.map((period, i) => ({
            id: i + 1,
            startDate: dayjs()
              .set('year', period.startDate?.year())
              .set('month', period.startDate?.date() > 20 ? period.startDate?.month() + 1 : period.startDate?.month())
              .format('MM.YYYY'),
            endDate: dayjs()
              .set('year', period.endDate?.year())
              .set('month', period.endDate?.date() > 15 ? period.endDate?.month() : period.endDate?.month() - 1)
              .format('MM.YYYY'),
            withQQSTotal: period.withQQSTotal,
            withoutQQSTotal: period.withoutQQSTotal,
            total: period.total
          }))}
          getRowClassName={({ row }) => 'bg-' + colors[row.id - 1]}
          hideFooter
          disableColumnMenu
          disableRowSelectionOnClick
          sx={{
            height: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            fontSize: '13px',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              color: 'text.secondary',
              borderBottom: '1px solid',
              borderColor: 'divider'
            },
            '& .MuiDataGrid-row': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              transition: 'background-color 0.1s ease',
              '&:hover': { filter: 'brightness(0.97)' }
            },
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
              alignItems: 'center'
            },
            // Har bir satr uchun rang sinflari
            '.bg-ff0000': { backgroundColor: '#ff000018' },
            '.bg-00ff00': { backgroundColor: '#00ff0018' },
            '.bg-0000ff': { backgroundColor: '#0000ff18' },
            '.bg-ff8000': { backgroundColor: '#ff800018' },
            '.bg-ffff00': { backgroundColor: '#ffff0018' },
            '.bg-80ff00': { backgroundColor: '#80ff0018' },
            '.bg-00ff80': { backgroundColor: '#00ff8018' },
            '.bg-00ffff': { backgroundColor: '#00ffff18' },
            '.bg-0080ff': { backgroundColor: '#0080ff18' },
            '.bg-8000ff': { backgroundColor: '#8000ff18' },
            '.bg-ff00ff': { backgroundColor: '#ff00ff18' },
            '.bg-ff0080': { backgroundColor: '#ff008018' }
          }}
        />
      </Box>
    </Stack>
  );
}

export default RecalculatorAbonent;

// Tarif elementlarini generatsiya qilish — o'zgartirilmagan
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
