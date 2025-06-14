import { DatePicker } from '@mui/x-date-pickers';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import { Grid, IconButton, Button, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import useStore from '../../views/billing/CreateAbonentPetition.jsx/useStore';
import { toast } from 'react-toastify';
import Delete from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { colors } from 'store/constant.js';
import api from 'utils/api.js';

dayjs.locale('uz-latn');

function RecalculatorAbonent() {
  const { recalculationPeriods, setRecalculationPeriods, aktType, rowsDhjTable } = useStore();
  const [hisoblandiJadval, setHisoblandiJadval] = useState([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [withQQS, setWithQQS] = useState(0);
  const [totalSumm, setTotalSumm] = useState(0);
  const [startDate, setStartDate] = useState({});
  const [endDate, setEndDate] = useState(dayjs());
  const qaytaHisob = ({ fromMoon, fromYear, toMoon, toYear, yashovchilar = 1 }) => {
    if (aktType === 'gps') {
      let summ = 0;
      let withNdsSumm = 0;
      rowsDhjTable.forEach((row) => {
        const [oy, yil] = row.davr.split('.');
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

      let result = [];
      for (let tariff of tariffs) {
        result.push(...getTarifElement(tariff));
      }
      setHisoblandiJadval(result);
    });
  }, []);

  useEffect(() => {
    qaytaHisob({
      fromMoon: startDate.$D > 15 ? startDate.$M + 1 : startDate.$M,
      fromYear: startDate.$y,
      toMoon: +(endDate.$D > 15 ? endDate.$M : endDate.$M - 1),
      toYear: endDate.$y
    });
  }, [startDate, endDate]);

  useEffect(() => {
    let total = 0;
    recalculationPeriods.forEach((period) => {
      total += period.total;
    });
    setTotalSumm(total);
  }, [recalculationPeriods]);

  const handleDatePickerChange = (e, name) => {
    switch (name) {
      case 'from':
        setStartDate(dayjs(e));
        break;
      case 'to':
        setEndDate(dayjs(e));
        break;
    }
  };

  const handleRemoveButtonClick = () => {
    if (currentTotal === 0) {
      return toast.info('Qiymat kiriting');
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
      return toast.info('Qiymat kiriting');
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
  const deleteItem = function (index) {
    setRecalculationPeriods(recalculationPeriods.filter((_, i) => i !== index));
  };
  return (
    <Grid container spacing={1} sx={{ pt: 1 }}>
      <Grid item xs={6}>
        <DatePicker
          views={['year', 'month']}
          minDate={dayjs('2019-01-01')}
          maxDate={dayjs()}
          label="dan"
          format="DD.MM.YY"
          onChange={(e) => handleDatePickerChange(e, 'from')}
        />
      </Grid>
      <Grid item xs={6}>
        <DatePicker
          views={['year', 'month']}
          minDate={dayjs('2019-01-01')}
          maxDate={dayjs()}
          label="gacha"
          format="DD.MM.YY"
          view="year"
          sx={{ margin: 'auto 10px' }}
          defaultValue={dayjs().startOf('month')}
          onChange={(e) => handleDatePickerChange(e, 'to')}
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">
          <Tooltip title="Debitor">
            <Button variant="outlined" color="error" onClick={handleAddButtonClick}>
              <AddIcon sx={{ color: 'red', fontSize: '30px' }} />
            </Button>
          </Tooltip>
          <Tooltip title="Kreditor">
            <Button variant="outlined" color="success" onClick={handleRemoveButtonClick}>
              <RemoveIcon sx={{ color: 'green', fontSize: '30px' }} />
            </Button>
          </Tooltip>
          {currentTotal}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h2">Jami: {totalSumm} so`m</Typography>
      </Grid>
      <DataGrid
        columns={[
          { field: 'id', headerName: '№', width: 50 },
          { field: 'startDate', headerName: 'qachondan', width: 100 },
          { field: 'endDate', headerName: 'qachongacha', width: 100 },
          { field: 'withQQSTotal', headerName: 'QQS bilan', width: 100 },
          { field: 'withoutQQSTotal', headerName: 'QQS siz', width: 100 },
          { field: 'total', headerName: 'Jami', width: 100 },
          {
            field: 'actions',
            headerName: 'Harakatlar',
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
          startDate: dayjs(period.startDate).format('MM.YYYY'),
          endDate: dayjs(period.endDate).format('MM.YYYY'),
          withQQSTotal: period.withQQSTotal,
          withoutQQSTotal: period.withoutQQSTotal,
          total: period.total
        }))}
        getRowClassName={({ row }) => 'bg-' + colors[row.id - 1]}
        hideFooter
        sx={{
          height: '300px',
          '.bg-ff0000': {
            backgroundColor: '#ff000050'
          },
          '.bg-00ff00': {
            backgroundColor: '#00ff0050'
          },
          '.bg-0000ff': {
            backgroundColor: '#0000ff50'
          },
          '.bg-ff8000': {
            backgroundColor: '#ff800050'
          },
          '.bg-ffff00': {
            backgroundColor: '#ffff0050'
          },
          '.bg-80ff00': {
            backgroundColor: '#80ff0050'
          },

          '.bg-00ff80': {
            backgroundColor: '#00ff8050'
          },
          '.bg-00ffff': {
            backgroundColor: '#00ffff50'
          },
          '.bg-0080ff': {
            backgroundColor: '#0080ff50'
          },
          '.bg-8000ff': {
            backgroundColor: '#8000ff50'
          },
          '.bg-ff00ff': {
            backgroundColor: '#ff00ff50'
          },
          '.bg-ff0080': {
            backgroundColor: '#ff008050'
          }
        }}
      />
    </Grid>
  );
}

export default RecalculatorAbonent;

function getTarifElement({ startAt, endAt, rate, rateWithoutQqs }) {
  const withQQS = rate - rateWithoutQqs;
  startAt = new Date(startAt);
  endAt = endAt ? new Date(endAt) : new Date();
  console.log(arguments, startAt, endAt);
  let month = startAt.getMonth();
  let year = startAt.getFullYear();
  let result = [];
  for (let i = 0; !(month === endAt.getMonth() && year === endAt.getFullYear()); i++) {
    console.log(month, year);

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
