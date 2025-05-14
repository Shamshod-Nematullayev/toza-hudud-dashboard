import React, { useEffect, useState } from 'react';
import MuiToolbar from '@mui/material/Toolbar';
import { Alert, Button, FormControl, Grid, IconButton, Stack, Typography } from '@mui/material';
import api from 'utils/api';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import DownloadIcon from '@mui/icons-material/Download';

function Toolbar({ filters, lastUpdateDate }) {
  const { t } = useTranslation();
  const { setIsLoading } = useLoaderStore();

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/court-service/debitor-abonents/excel', { params: filters, responseType: 'blob' });
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'qarzdor_abonentlar.xlsx';
      link.click();
    } catch (err) {
      console.log(err);
      toast.error('Xatolik kuzatildi');
    } finally {
      setIsLoading(false);
    }
  };
  const now = new Date();
  return (
    <MuiToolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Button variant="contained" color="success" sx={{ marginRight: '10px' }} onClick={handleExport}>
          <DownloadIcon fontSize="small" />
          {t('buttons.export')}
        </Button>
      </div>
      <Alert
        sx={{ fontSize: '15px' }}
        color={
          lastUpdateDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
            ? 'success'
            : lastUpdateDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5)
              ? 'warning'
              : 'error'
        }
      >
        {console.log(lastUpdateDate, new Date(now.getFullYear(), now.getMonth(), now.getDate()))}
        {t('qarzdorAbonentlarPage.Oxirgi yangilanish vaqti')}: {lastUpdateDate?.toLocaleString()}
      </Alert>
    </MuiToolbar>
  );
}

export default Toolbar;
