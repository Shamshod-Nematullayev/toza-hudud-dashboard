import { Download, GridOn } from '@mui/icons-material';
import { Backdrop, Button, CircularProgress, Toolbar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import { t } from 'i18next';
import { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import ImportSmsModal from './ImportSmsModal';

function SmsWarnings() {
  const [reloadState, setReloadState] = useState(false);
  const { dataGridProps } = useServerDataGrid(
    async (params) => {
      const { data } = await api.get('/sms-service/warnings', { params });
      return {
        meta: data.meta,
        data: data.content
      };
    },
    [],
    25,
    { reloadState }
  );

  const [openImportModal, setOpenImportModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const handleImport = async (excelFile: File) => {
    const formData = new FormData();
    formData.append('file', excelFile);
    setLoading(true);
    await api.post('/sms-service/warnings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

    setLoading(false);
    setReloadState(!reloadState);
  };

  const handleClickExport = async () => {
    try {
      const response = await api.get('/sms-service/warnings/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sms_warnings.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <MainCard>
      {loading && (
        <Backdrop
          sx={{
            color: '#fff',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      <ImportSmsModal open={openImportModal} onClose={() => setOpenImportModal(false)} onSave={handleImport} />
      <DataGrid
        {...dataGridProps}
        slots={{
          toolbar: () => (
            <Toolbar sx={{ gap: 2 }}>
              <Button startIcon={<Download />} onClick={() => setOpenImportModal(true)} variant="contained" color="success">
                {t('buttons.import')}
              </Button>
              <Button startIcon={<GridOn />} onClick={handleClickExport} variant="outlined" color="primary">
                {t('buttons.export')}
              </Button>
            </Toolbar>
          )
        }}
        columns={[
          { field: 'id', headerName: 'ID', width: 50 },
          { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), flex: 1 },
          { field: 'debtAmount', headerName: t('tableHeaders.debtAmount'), flex: 1, type: 'number' },
          { field: 'phone', headerName: t('tableHeaders.phone'), flex: 1 },
          {
            field: 'status',
            headerName: t('tableHeaders.status'),
            flex: 1,
            renderCell: ({ row }) => t(`smsWarningStatus.${row.status as 'pending'}`)
          },
          {
            field: 'createdAt',
            headerName: t('tableHeaders.createdDate'),
            flex: 1,
            type: 'dateTime',
            valueGetter: (params) => new Date(params)
          },
          { field: 'errorMessage', headerName: t('tableHeaders.errorMessage'), flex: 1 }
        ]}
      />
    </MainCard>
  );
}

export default SmsWarnings;
