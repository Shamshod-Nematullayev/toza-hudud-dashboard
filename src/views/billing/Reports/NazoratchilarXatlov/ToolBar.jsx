import { Clear, Refresh } from '@mui/icons-material';
import { Button, IconButton, MenuItem, Select, Stack, Tooltip } from '@mui/material';
import React from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { t } from 'i18next';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MuiToolbar from '@mui/material/Toolbar';
import api from 'utils/api';
import useLoaderStore from 'store/loaderStore';

function ToolBar({ filters, setFilters, refreshTable }) {
  const { isLoading, setIsLoading } = useLoaderStore();
  const handleExport = async () => {
    setIsLoading(true);
    try {
      await api.get('/reports/confirmed-abonentdata-by-inspectors/excel', { params: filters });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClickClear = () =>
    setFilters({
      fromDate: null,
      toDate: null
    });
  return (
    <MuiToolbar direction={'row'} sx={{ margin: '10px 5px' }}>
      <Button disabled={isLoading} variant="contained" color="success" sx={{ marginRight: '10px' }} onClick={handleExport}>
        <DownloadIcon fontSize="small" />
        {t('buttons.export')}
      </Button>
      <DatePicker
        value={filters.fromDate}
        onChange={(date) => setFilters({ ...filters, fromDate: date })}
        label={'Qachondan'}
        sx={{ marginRight: '10px', width: 160 }}
        format="DD.MM.YYYY"
      />
      <DatePicker
        value={filters.toDate}
        onChange={(date) => setFilters({ ...filters, toDate: date })}
        label={'Qachongacha'}
        sx={{ marginRight: '10px', width: 160 }}
        format="DD.MM.YYYY"
      />
      <Tooltip title={t('buttons.refresh')} arrow>
        <IconButton onClick={refreshTable} disabled={isLoading}>
          <Refresh />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('buttons.clear')}>
        <IconButton onClick={handleClickClear}>
          <Clear />
        </IconButton>
      </Tooltip>
    </MuiToolbar>
  );
}

export default ToolBar;
