import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import useLoaderStore from 'store/loaderStore';

function ReportsTable() {
  const { t } = useTranslation();
  const { isLoading, setIsLoading } = useLoaderStore();
  const [columns, setColumns] = useState([
    { field: 'id', headerName: 'ID', width: 50, renderCell: (row) => row.row.i + 1 },
    { field: 'name', headerName: t('tableHeaders.fullName'), width: 150, flex: 1 },
    { field: 'pnflConfirmed', headerName: t('tableHeaders.allPnflCount'), flex: 1 },
    { field: 'pnflConfirmedByDate', headerName: t('tableHeaders.onPeriodPnflCount'), flex: 1, type: 'number' },
    { field: 'etkConfirmed', headerName: t('tableHeaders.allEtkCount'), flex: 1, type: 'number' },
    { field: 'etkConfirmedByDate', headerName: t('tableHeaders.onPeriodEtkCount'), flex: 1, type: 'number' }
  ]);
  const [rows, setRows] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    api
      .get('/reports/confirmed-abonentdata-by-inspectors')
      .then(({ data }) => {
        setRows(data.map((row, i) => ({ ...row, i })));
      })
      .finally(() => setIsLoading(false));
  }, []);
  return (
    <div
      style={{
        height: '100%'
      }}
    >
      <DataGrid columns={columns} rows={rows} sx={{ height: '97%' }} loading={isLoading} hideFooter />
    </div>
  );
}

export default ReportsTable;
