import { GridOn } from '@mui/icons-material';
import { Button, Toolbar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import { t } from 'i18next';
import { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import ImportSmsModal from './ImportSmsModal';

function SmsWarnings() {
  const { dataGridProps } = useServerDataGrid(async (params) => {
    const { data } = await api.get('/sms-service/warnings', { params });
    return {
      meta: data.meta,
      data: data.content
    };
  });

  const [openImportModal, setOpenImportModal] = useState(false);

  const handleImport = (excelFile: File) => {
    const formData = new FormData();
    formData.append('file', excelFile);
    api.post('/sms-service/warnings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  };
  return (
    <MainCard>
      <ImportSmsModal open={openImportModal} onClose={() => setOpenImportModal(false)} onSave={handleImport} />
      <DataGrid
        {...dataGridProps}
        slots={{
          toolbar: () => (
            <Toolbar>
              <Button startIcon={<GridOn />} onClick={() => setOpenImportModal(true)} variant="outlined">
                {t('buttons.export')}
              </Button>
            </Toolbar>
          )
        }}
        columns={[
          { field: 'id', headerName: 'ID', width: 50 },
          { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), flex: 1 },
          { field: 'debtAmount', headerName: t('tableHeaders.debtAmount'), flex: 1 },
          { field: 'phone', headerName: t('tableHeaders.phone'), flex: 1 },
          { field: 'status', headerName: t('tableHeaders.status'), flex: 1 },
          { field: 'createdAt', headerName: t('tableHeaders.createdDate'), flex: 1 },
          { field: 'errorMessage', headerName: t('tableHeaders.errorMessage'), flex: 1 }
        ]}
      />
    </MainCard>
  );
}

export default SmsWarnings;
