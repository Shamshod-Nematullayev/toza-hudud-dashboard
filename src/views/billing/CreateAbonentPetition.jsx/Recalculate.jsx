import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import { IconButton, Typography } from '@mui/material';
import hisoblandiJadval from './tarif.js';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';

dayjs.locale('uz-latn');
function Recalculate() {
  const [currentTotal, setCurrentTotal] = React.useState(0);
  const [startDate, setStartDate] = React.useState({});
  const [endDate, setEndDate] = React.useState(dayjs());
  const qaytaHisob = ({ fromMoon, fromYear, toMoon, toYear, yashovchilar = 1 }) => {
    let summ = 0;
    let nds = 0;
    for (let i = 0; i < hisoblandiJadval.length; i++) {
      const davr = hisoblandiJadval[i];

      if ((davr.year == fromYear && davr.month >= fromMoon) || davr.year > fromYear) {
        if (davr.year < toYear || (davr.year == toYear && davr.month <= toMoon)) {
          if (davr.nds) {
            nds += davr.nds * yashovchilar;
          }
          summ += davr.hisoblandi * yashovchilar;
        }
      }
    }
    console.log(fromMoon, fromYear, toMoon, toYear, yashovchilar);
    // setCurrentNds(nds);
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
        <IconButton sx={{ margin: 'auto 10px' }}>
          <ArrowCircleDownIcon sx={{ color: 'green', fontSize: '30px' }} />
        </IconButton>
        <Typography variant="h3" sx={{ minWidth: 300 }}>
          {currentTotal}
        </Typography>
        <Typography variant="h2">Jami: {currentTotal} so`m</Typography>
      </div>
    </div>
  );
}

export default Recalculate;
