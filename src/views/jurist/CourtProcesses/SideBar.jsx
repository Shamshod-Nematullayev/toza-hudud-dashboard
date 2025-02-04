import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import useStore from './useStore';

function SideBar() {
  const { filter, setFilter } = useStore();
  const [actStatus, setActStatus] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [warningFromDate, setWarningFromDate] = useState(null);
  const [warningToDate, setWarningToDate] = useState(null);
  const [claimAmountFrom, setClaimAmountFrom] = useState(null);
  const [claimAmountTo, setClaimAmountTo] = useState(null);

  const handleClickClearButton = () => {
    setActStatus(null);
    setWarningFromDate(null);
    setWarningToDate(null);
    setClaimAmountFrom(null);
    setClaimAmountTo(null);
    setFilter({});
  };
  const handleClickSeachButton = () => {
    setFilter({
      status: actStatus,
      account_number: accountNumber,
      warning_date_from: warningFromDate ? warningFromDate.$d : null,
      warning_date_to: warningToDate ? warningToDate.$d : null,
      claim_amount_from: claimAmountFrom,
      claim_amount_to: claimAmountTo
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="ariza-type-label">Akt holati</InputLabel>
            <Select label="Ariza turi" labelId="ariza-type-label" value={actStatus} onChange={(e) => setActStatus(e.target.value)}>
              <MenuItem value="">Hammasi</MenuItem>
              <MenuItem value="yangi">Yangi</MenuItem>
              <MenuItem value="ariza_yaratildi">Ariza yaratilgan</MenuItem>
              <MenuItem value="ariza_imzolandi">Ariza imzolangan</MenuItem>
              <MenuItem value="sudga_ariza_berildi">Sudga yuborilgan</MenuItem>
              <MenuItem value="sud_qarori_chiqorildi">Sud qarori chiqarilgan</MenuItem>
              <MenuItem value="rad_etildi">Rad etilgan</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Ogohlantirilgan vaqti</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <DatePicker
            views={['year', 'month', 'day']}
            minDate={dayjs('2023-01-01')}
            maxDate={dayjs()}
            label="dan"
            value={warningFromDate}
            onChange={(e) => setWarningFromDate(dayjs(e))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DatePicker
            views={['year', 'month', 'day']}
            minDate={dayjs('2023-01-01')}
            maxDate={dayjs()}
            label="gacha"
            value={warningToDate}
            onChange={(e) => setWarningToDate(dayjs(e))}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Da'vo summasi</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="dan" type="number" value={claimAmountFrom} onChange={(e) => setClaimAmountFrom(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="gacha" type="number" value={claimAmountTo} onChange={(e) => setClaimAmountTo(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button color="info" variant="outlined" onClick={handleClickClearButton} fullWidth>
            Tozalash
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button color="primary" variant="contained" onClick={handleClickSeachButton} fullWidth>
            Qidirish
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

export default SideBar;
