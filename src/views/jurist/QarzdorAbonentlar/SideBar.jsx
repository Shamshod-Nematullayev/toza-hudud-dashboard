import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

function SideBar({ filters, setFilters, setRefreshState }) {
  const { t } = useTranslation();
  const handleReset = () => {
    setFilters({ balanceFrom: 50000, balanceTo: '', sudAkt: '', warning: '' });
    setRefreshState((state) => !state);
  };
  const handleRefresh = () => setRefreshState((state) => !state);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          label={t('tableHeaders.debitorFrom')}
          value={filters.balanceFrom}
          type="number"
          InputProps={{ inputProps: { step: 50000 } }}
          onChange={(e) => setFilters({ ...filters, balanceFrom: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label={t('tableHeaders.debitorTo')}
          value={filters.balanceTo}
          type="number"
          InputProps={{ inputProps: { step: 50000 } }}
          onChange={(e) => setFilters({ ...filters, balanceTo: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="sudAkt">{t('tableHeaders.sudAkt')}</InputLabel>
          <Select
            labelId="sudAkt"
            value={filters.sudAkt}
            onChange={(e) => setFilters({ ...filters, sudAkt: e.target.value })}
            label={t('tableHeaders.sudAkt')}
          >
            <MenuItem value={''}>{t('all')}</MenuItem>
            <MenuItem value={'true'}>{t("qarzdorAbonentlarPage.Sudga o'tgan")}</MenuItem>
            <MenuItem value={'false'}>{t("qarzdorAbonentlarPage.Sudga o'tmagan")}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="warning">{t('tableHeaders.warning')}</InputLabel>
          <Select
            labelId="warning"
            value={filters.warning}
            onChange={(e) => setFilters({ ...filters, warning: e.target.value })}
            label={t('tableHeaders.warning')}
          >
            <MenuItem value={''}>{t('all')}</MenuItem>
            <MenuItem value={'true'}>{t('qarzdorAbonentlarPage.Ogohlantirilgan')}</MenuItem>
            <MenuItem value={'false'}>{t('qarzdorAbonentlarPage.Ogohlantirilmagan')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <Button color="info" variant="outlined" fullWidth onClick={handleReset}>
          {t('buttons.clear')}
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button variant="contained" fullWidth onClick={handleRefresh}>
          {t('buttons.refresh')}
        </Button>
      </Grid>
    </Grid>
  );
}

export default SideBar;
