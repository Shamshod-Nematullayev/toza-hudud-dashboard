import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import { Icon, IconButton, List, ListItem, Typography } from '@mui/material';
import hisoblandiJadval from './tarif.js';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import useStore from './useStore.js';
import { toast } from 'react-toastify';
import Delete from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';

dayjs.locale('uz-latn');
function Recalculate() {
  const { recalculationPeriods, setRecalculationPeriods, aktType, rowsDhjTable } = useStore();
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
    qaytaHisob({
      fromMoon: startDate.$M,
      fromYear: startDate.$y,
      toMoon: endDate.$M,
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

  const handleAddButtonClick = () => {
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
  const deleteItem = function (index) {
    setRecalculationPeriods(recalculationPeriods.filter((_, i) => i !== index));
  };
  return (
    <div style={{ margin: '25px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={['year', 'month']}
            minDate={dayjs('2019-01-01')}
            maxDate={dayjs()}
            label="dan"
            onChange={(e) => handleDatePickerChange(e, 'from')}
          />
          <DatePicker
            views={['year', 'month']}
            minDate={dayjs('2019-01-01')}
            maxDate={dayjs()}
            label="gacha"
            sx={{ margin: 'auto 10px' }}
            defaultValue={dayjs()}
            onChange={(e) => handleDatePickerChange(e, 'to')}
          />
        </LocalizationProvider>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', margin: '20px auto' }}>
        <IconButton sx={{ margin: 'auto 10px' }} onClick={handleAddButtonClick}>
          <ArrowCircleDownIcon sx={{ color: 'green', fontSize: '30px' }} />
        </IconButton>
        <Typography variant="h3" sx={{ minWidth: 300 }}>
          {currentTotal}
        </Typography>
        <Typography variant="h2">Jami: {totalSumm} so`m</Typography>
      </div>
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
        sx={{
          maxHeight: 500
        }}
      />
    </div>
  );
}

export default Recalculate;
