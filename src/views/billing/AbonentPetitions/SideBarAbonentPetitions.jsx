import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { gridSpacing } from 'store/constant';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import useStore from './useStore';

function SideBar() {
  const { setFilter, setDocumentNumber } = useStore();
  const [arizaType, setArizaType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [dublicatAccountNumber, setDublicatAccountNumber] = useState('');
  const [createdFromDate, setCreatedFromDate] = useState(null);
  const [createdToDate, setCreatedToDate] = useState(null);
  const [actFromDate, setActFromDate] = useState(null);
  const [actToDate, setActToDate] = useState(null);
  const [actAmountFrom, setActAmountFrom] = useState();
  const [actAmountTo, setActAmountTo] = useState('');
  const [arizaStatus, setArizaStatus] = useState('');
  const [actStatus, setActStatus] = useState('');

  const handleClickClearButton = () => {
    setArizaType('');
    setAccountNumber('');
    setDublicatAccountNumber('');
    setCreatedFromDate(null);
    setCreatedToDate(null);
    setActFromDate(null);
    setActToDate(null);
    setActAmountFrom('');
    setActAmountTo('');
    setArizaStatus('');
    setActStatus('');
    setFilter({});
    setDocumentNumber('');
  };
  const handleClickSeachButton = () => {
    console.log(arizaStatus);
    setFilter({
      document_type: arizaType,
      account_number: accountNumber,
      dublicat_account_number: dublicatAccountNumber,
      created_from_date: createdFromDate ? createdFromDate.$d : null,
      created_to_date: createdToDate ? createdToDate.$d : null,
      act_from_date: actFromDate ? actFromDate.$d : null,
      act_to_date: actToDate ? actToDate.$d : null,
      act_amount_from: actAmountFrom,
      act_amount_to: actAmountTo,
      ariza_status: arizaStatus,
      act_status: actStatus
    });
  };

  return (
    <Card sx={{ border: '1px solid #ccc', minHeight: 'calc(100vh - 200px)', padding: '5px 10px' }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h3" sx={{ textAlign: 'center' }}>
            Filterlar
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="ariza-type-label">Ariza turi</InputLabel>
            <Select label="Ariza turi" labelId="ariza-type-label" value={arizaType} onChange={(e) => setArizaType(e.target.value)}>
              <MenuItem value="">Hammasi</MenuItem>
              <MenuItem value="odam_soni">Odam soni</MenuItem>
              <MenuItem value="death">O'lim guvohnomasi</MenuItem>
              <MenuItem value="viza">Pasport vizasi</MenuItem>
              <MenuItem value="gps">GPS xulosasi</MenuItem>
              <MenuItem value="dvaynik">Ikkilamchi kod</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <AccountNumberInput label="Hisob raqam" value={accountNumber} setFunc={setAccountNumber} fullWidth />
        </Grid>
        <Grid item xs={12} sx={{ display: arizaType === 'dvaynik' ? 'inline-block' : 'none' }}>
          <AccountNumberInput label="Ikkilamchi hisob raqam" value={dublicatAccountNumber} setFunc={setDublicatAccountNumber} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Yaratilgan qilingan vaqti</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year', 'month', 'day']}
              minDate={dayjs('2024-07-01')}
              maxDate={dayjs()}
              label="dan"
              value={createdFromDate}
              onChange={(e) => setCreatedFromDate(dayjs(e))}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year', 'month', 'day']}
              minDate={dayjs('2024-07-01')}
              maxDate={dayjs()}
              label="gacha"
              value={createdToDate}
              onChange={(e) => setCreatedToDate(dayjs(e))}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Akt qilingan vaqti</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year', 'month', 'day']}
              minDate={dayjs('2024-07-01')}
              maxDate={dayjs()}
              label="dan"
              value={actFromDate}
              onChange={(e) => setActFromDate(dayjs(e))}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year', 'month', 'day']}
              minDate={dayjs('2024-07-01')}
              maxDate={dayjs()}
              label="gacha"
              value={actToDate}
              onChange={(e) => setActToDate(dayjs(e))}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Akt summasi</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="dan" value={actAmountFrom} onChange={(e) => setActAmountFrom(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="gacha" value={actAmountTo} onChange={(e) => setActAmountTo(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="ariza-status-label">Ariza holati</InputLabel>
            <Select label="Ariza turi" labelId="ariza-status-label" value={arizaStatus} onChange={(e) => setArizaStatus(e.target.value)}>
              <MenuItem value="">Hammasi</MenuItem>
              <MenuItem value="yangi">Yangi</MenuItem>
              <MenuItem value="qabul qilindi">Qabul qilindi</MenuItem>
              <MenuItem value="tasdiqlangan">Tasdiqlandi</MenuItem>
              <MenuItem value="bekor qilindi">Bekor qilindi</MenuItem>
              <MenuItem value="akt_kiritilgan">Akt kiritildi</MenuItem>
              <MenuItem value="qayta_akt_kiritilgan">Qayta akt kiritildi</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="act-status-label">Akt holati</InputLabel>
            <Select label="Ariza turi" labelId="act-status-label" value={actStatus} onChange={(e) => setActStatus(e.target.value)}>
              <MenuItem value="">Hammasi</MenuItem>
              <MenuItem value="NEW">Yangi</MenuItem>
              <MenuItem value="WARNED">Ogohlantirildi</MenuItem>
              <MenuItem value="CONFIRMED">Tasdiqlandi</MenuItem>
              <MenuItem value="CANCELLED">Bekor qilindi</MenuItem>
              <MenuItem value="CONFIRMED_CANCELLED">Tasdiqlangan bekor qilindi</MenuItem>
              <MenuItem value="WARNED_CANCELLED">Ogohlantirildi bekor qilindi</MenuItem>
            </Select>
          </FormControl>
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
    </Card>
  );
}

export default SideBar;
