import { Button, Grid, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import useWarningLettersStore from './useStore';
import AccountNumberInput from 'ui-component/AccountNumberInput';

function SideBarWarnings() {
  const { setFilters, setFromDate, setToDate } = useWarningLettersStore();
  const [actStatus, setActStatus] = useState(null);
  const [accountNumber, setAccountNumber] = useState(null);
  const [caseNumber, setCaseNumber] = useState(null);
  const [warningFromDate, setWarningFromDate] = useState(null);
  const [warningToDate, setWarningToDate] = useState(null);
  const [claimAmountFrom, setClaimAmountFrom] = useState(null);
  const [claimAmountTo, setClaimAmountTo] = useState(null);

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

  const handleClickClearButton = () => {
    setActStatus(null);
    setWarningFromDate(null);
    setWarningToDate(null);
    setClaimAmountFrom(null);
    setClaimAmountTo(null);
    setAccountNumber(null);
    setCaseNumber('');
    setFilters({});
  };
  const handleClickSeachButton = () => {
    setFilters({
      status: actStatus,
      account_number: accountNumber,
      warning_date_from: warningFromDate ? warningFromDate.$d : null,
      warning_date_to: warningToDate ? warningToDate.$d : null,
      claim_amount_from: claimAmountFrom,
      claim_amount_to: claimAmountTo,
      case_number: caseNumber
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <AccountNumberInput label="Hisob raqam" type="number" setFunc={setAccountNumber} value={accountNumber ?? ''} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Ogohlantirilgan vaqti</Typography>
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            views={['year', 'month']}
            minDate={dayjs('2019-01-01')}
            maxDate={dayjs()}
            label="dan"
            name="from"
            defaultValue={dayjs()}
            onChange={(e) => handleDatePickerChange(e, 'from')}
          />{' '}
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            views={['year', 'month']}
            minDate={dayjs('2019-01-01')}
            maxDate={dayjs()}
            label="gacha"
            name="to"
            sx={{ margin: 'auto 10px' }}
            defaultValue={dayjs()}
            onChange={(e) => handleDatePickerChange(e, 'to')}
          />{' '}
        </Grid>
        {/* <Grid item xs={12}>
          <DatePicker
            views={['year', 'month', 'day']}
            minDate={dayjs('2023-01-01')}
            maxDate={dayjs()}
            label="dan"
            value={warningFromDate}
            onChange={(e) => setWarningFromDate(dayjs(e))}
            sx={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={12}>
          <DatePicker
            views={['year', 'month', 'day']}
            minDate={dayjs('2023-01-01')}
            maxDate={dayjs()}
            label="gacha"
            value={warningToDate}
            onChange={(e) => setWarningToDate(dayjs(e))}
            sx={{ width: '100%' }}
          />
        </Grid> */}
        <Grid item xs={12}>
          <Typography variant="h5">Da&apos;vo summasi</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="dan"
            type="number"
            value={claimAmountFrom || ''}
            onChange={(e) => setClaimAmountFrom(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField label="gacha" type="number" value={claimAmountTo ?? ''} onChange={(e) => setClaimAmountTo(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Button color="primary" variant="contained" onClick={handleClickSeachButton} fullWidth>
            Qidirish
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button color="info" variant="outlined" onClick={handleClickClearButton} fullWidth>
            Tozalash
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

export default SideBarWarnings;
