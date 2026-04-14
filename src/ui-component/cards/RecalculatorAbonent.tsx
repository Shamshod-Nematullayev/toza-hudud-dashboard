import { CalendarIcon, DatePicker } from '@mui/x-date-pickers';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import { Grid, IconButton, Button, Tooltip, Typography, Stack, ButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useStore } from '../../views/billing/CreateAbonentPetition.jsx/useStore.js';
import { toast } from 'react-toastify';
import Delete from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { colors } from 'store/constant.js';
import api from 'utils/api.js';
import { useTranslation } from 'react-i18next';
import { CalendarMonth } from '@mui/icons-material';

dayjs.locale('uz-latn');

function RecalculatorAbonent() {
  const { t } = useTranslation();
  const { recalculationPeriods, setRecalculationPeriods, aktType, rowsDhjTable, hisoblandiJadval, setHisoblandiJadval } = useStore();
  const [currentTotal, setCurrentTotal] = useState(0);
  const [withQQS, setWithQQS] = useState(0);
  const [totalSumm, setTotalSumm] = useState(0);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs().startOf('month'));

  const qaytaHisob = ({ fromMoon, fromYear, toMoon, toYear, yashovchilar = 1 }) => {
    if (aktType === 'gps') {
      let summ = 0;
      let withNdsSumm = 0;
      rowsDhjTable.forEach((row) => {
        const [oy, yil] = row.davr.split('.').map(Number);
        if (((oy - 1 >= fromMoon && yil == fromYear) || yil > fromYear) && ((oy - 1 <= toMoon && yil == toYear) || yil < toYear)) {
          const withQQS = hisoblandiJadval.find((row) => row.year == yil && row.month == oy)?.withQQS;
          if (withQQS) {
            withNdsSumm += row.nachis;
          }
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
          if (davr.withQQS) {
            withQQS += davr.hisoblandi * yashovchilar;
          }
          summ += davr.hisoblandi * yashovchilar;
        }
      }
    }
    setWithQQS(withQQS);
    setCurrentTotal(summ);
  };

  useEffect(() => {
    api.get('/billing/get-tariffs').then((res) => {
      const tariffs = res.data.tariffs;

      let result = [
        {
          month: 1,
          year: 2019,
          hisoblandi: 2000,
          withQQS: 2000
        }
      ];
      for (let tariff of tariffs) {
        result.push(
          ...getTarifElement(tariff).filter((row) => result.find((r) => r.month == row.month && r.year == row.year) == undefined)
        );
      }
      setHisoblandiJadval(result.sort((r1, r2) => r1.year - r2.year || r1.month - r2.month));
    });
  }, []);

  useEffect(() => {
    qaytaHisob({
      fromMoon: startDate?.date() > 15 ? startDate?.month() + 1 : startDate?.month(),
      fromYear: startDate?.year(),
      toMoon: +(endDate?.date() > 15 ? endDate?.month() : endDate?.month() - 1),
      toYear: endDate?.year()
    });
  }, [startDate, endDate]);

  useEffect(() => {
    let total = 0;
    recalculationPeriods.forEach((period) => {
      total += period.total;
    });
    setTotalSumm(total);
  }, [recalculationPeriods]);

  useEffect(() => {
    setEndDate(dayjs().startOf('month'));
  }, [aktType]);

  const handleRemoveButtonClick = () => {
    if (currentTotal === 0) {
      return toast.info(t('recalculator.noValue'));
    }
    if (aktType == 'gps')
      return setRecalculationPeriods([
        {
          withQQSTotal: withQQS,
          withoutQQSTotal: currentTotal - withQQS,
          total: currentTotal,
          startDate,
          endDate
        }
      ]);
    setRecalculationPeriods([
      ...recalculationPeriods,
      {
        withQQSTotal: withQQS,
        withoutQQSTotal: currentTotal - withQQS,
        total: currentTotal,
        startDate,
        endDate
      }
    ]);
  };

  const handleAddButtonClick = () => {
    if (currentTotal === 0) {
      return toast.info(t('recalculator.noValue'));
    }
    if (aktType == 'gps')
      return setRecalculationPeriods([
        {
          withQQSTotal: withQQS * -1,
          withoutQQSTotal: (currentTotal - withQQS) * -1,
          total: currentTotal * -1,
          startDate,
          endDate
        }
      ]);
    setRecalculationPeriods([
      ...recalculationPeriods,
      {
        withQQSTotal: withQQS * -1,
        withoutQQSTotal: (currentTotal - withQQS) * -1,
        total: currentTotal * -1,
        startDate,
        endDate
      }
    ]);
  };

  const deleteItem = (index: number) => {
    setRecalculationPeriods(recalculationPeriods.filter((_, i) => i !== index));
  };

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 1 }}>
      <Grid container spacing={0.5} alignItems="center">
        <Grid item xs={3}>
          <DatePicker
            views={['year', 'month']}
            minDate={dayjs('2019-01-01')}
            maxDate={dayjs()}
            label={t('recalculator.from')}
            format="DD.MM.YY"
            value={startDate}
            onChange={setStartDate}
            sx={{
              input: {
                fontSize: '12px'
              }
            }}
            slotProps={{
              openPickerIcon: {
                sx: {
                  fontSize: '16px'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <DatePicker
            views={['year', 'month']}
            minDate={dayjs('2019-01-01')}
            maxDate={dayjs()}
            label={t('recalculator.to')}
            format="DD.MM.YY"
            sx={{
              input: {
                fontSize: '12px'
              }
            }}
            slotProps={{
              openPickerIcon: {
                sx: {
                  fontSize: '16px'
                }
              }
            }}
            value={endDate}
            onChange={setEndDate}
            disabled={aktType === 'death'}
          />
        </Grid>
        <Grid item xs={3}>
          <>
            <Tooltip title={t('recalculator.debitor')}>
              <Button variant="outlined" color="error" onClick={handleAddButtonClick} sx={{ height: '40px', minWidth: '40px' }}>
                <AddIcon sx={{ color: 'red' }} />
              </Button>
            </Tooltip>

            <Tooltip title={t('recalculator.kreditor')}>
              <Button variant="outlined" color="success" onClick={handleRemoveButtonClick} sx={{ height: '40px', minWidth: '40px' }}>
                <RemoveIcon sx={{ color: 'green' }} />
              </Button>
            </Tooltip>
          </>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2">{currentTotal}</Typography>

          <Typography variant="subtitle1">
            {t('recalculator.total')}: {totalSumm.toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
      <DataGrid
        columns={[
          { field: 'id', headerName: '№', width: 50 },
          { field: 'startDate', headerName: t('recalculator.periodFrom'), flex: 1 },
          { field: 'endDate', headerName: t('recalculator.periodTo') },
          { field: 'total', headerName: t('recalculator.sum'), width: 100, flex: 1 },
          {
            field: 'actions',
            headerName: t('recalculator.actions'),
            renderCell: (cell) => {
              return (
                <IconButton onClick={() => deleteItem(cell.row.id - 1)}>
                  <Delete />
                </IconButton>
              );
            }
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
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          '.bg-ff0000': { backgroundColor: '#ff000050' },
          '.bg-00ff00': { backgroundColor: '#00ff0050' },
          '.bg-0000ff': { backgroundColor: '#0000ff50' },
          '.bg-ff8000': { backgroundColor: '#ff800050' },
          '.bg-ffff00': { backgroundColor: '#ffff0050' },
          '.bg-80ff00': { backgroundColor: '#80ff0050' },
          '.bg-00ff80': { backgroundColor: '#00ff8050' },
          '.bg-00ffff': { backgroundColor: '#00ffff50' },
          '.bg-0080ff': { backgroundColor: '#0080ff50' },
          '.bg-8000ff': { backgroundColor: '#8000ff50' },
          '.bg-ff00ff': { backgroundColor: '#ff00ff50' },
          '.bg-ff0080': { backgroundColor: '#ff008050' }
        }}
      />
    </Stack>
  );
}

export default RecalculatorAbonent;

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
