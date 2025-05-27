import React, { useEffect } from 'react';
import MuiToolbar from '@mui/material/Toolbar';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Cancel, Done, Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { actStatusOptions } from 'store/constant';

function Toolbar({ selectedRows, filters, setFilters }) {
  const { t } = useTranslation();
  return (
    <MuiToolbar sx={{ gap: '5px', alignItems: 'center' }}>
      <Button variant="contained" color="primary" disabled={!selectedRows.length}>
        <Done />
        Tekshirildi
      </Button>
      <Button variant="contained" color="warning" disabled={!selectedRows.length}>
        <Warning /> Ogohlantirish
      </Button>
      <Button variant="contained" color="error" disabled={!selectedRows.length}>
        <Cancel />
        Bekor qilish
      </Button>
      <FormControl variant="standard">
        <InputLabel id="checkStatus">{t('tableHeaders.checkStatus')}</InputLabel>
        <Select
          label={t('tableHeaders.checkStatus')}
          labelId="checkStatus"
          sx={{ minWidth: '150px' }}
          value={filters.checkStatus}
          onChange={(e) => setFilters({ ...filters, checkStatus: e.target.value })}
        >
          <MenuItem value="">Hammasi</MenuItem>
          <MenuItem value="tekshirildi">Tekshirildi</MenuItem>
          <MenuItem value="ogohlantirildi">Ogohlantirildi</MenuItem>
          <MenuItem value="bekor_qilindi">Bekor qilindi</MenuItem>
          <MenuItem value="yangi">Tekshirilmagan</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="standard">
        <InputLabel id="status">{t('tableHeaders.status')}</InputLabel>
        <Select
          label={t('tableHeaders.status')}
          labelId="status"
          sx={{ minWidth: '150px' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          {actStatusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </MuiToolbar>
  );
}

export default Toolbar;
