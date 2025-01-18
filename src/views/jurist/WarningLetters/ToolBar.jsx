import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import React, { useEffect } from 'react';
import useWarningLettersStore from './useStore';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

function ToolBar() {
  const { setFromDate, setToDate } = useWarningLettersStore();
  const handleDatePickerChange = (e, name) => {
    switch (name) {
      case 'from':
        setFromDate(new Date(dayjs(e)));
        break;
      case 'to':
        setToDate(new Date(dayjs(e)));
        break;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          views={['year', 'month']}
          minDate={dayjs('2019-01-01')}
          maxDate={dayjs()}
          label="dan"
          name="from"
          defaultValue={dayjs()}
          onChange={(e) => handleDatePickerChange(e, 'from')}
        />
        <DatePicker
          views={['year', 'month']}
          minDate={dayjs('2019-01-01')}
          maxDate={dayjs()}
          label="gacha"
          name="to"
          sx={{ margin: 'auto 10px' }}
          defaultValue={dayjs()}
          onChange={(e) => handleDatePickerChange(e, 'to')}
        />
      </LocalizationProvider>
    </div>
  );
}

export default ToolBar;
