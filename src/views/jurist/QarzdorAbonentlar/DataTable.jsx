import { Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useLoaderStore from 'store/loaderStore';
import api from 'utils/api';
import Toolbar from './Toolbar';

function DataTable({ filters, refreshState, lastUpdateDate }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const { isLoading, setIsLoading } = useLoaderStore();
  const { t } = useTranslation();

  const columns = [
    { field: 'id', headerName: 'ID', width: 50, renderCell: (row) => row.row.i + 1 + page * pageSize },
    { field: 'fio', headerName: t('tableHeaders.fullName'), width: 200, flex: 1 },
    { field: 'licshet', headerName: t('tableHeaders.accountNumber'), width: 130 },
    { field: 'mahalla_name', headerName: t('tableHeaders.mfy'), width: 200 },
    { field: 'ksaldo', headerName: t('tableHeaders.debit'), width: 100, type: 'number' },
    {
      field: 'sudAktDate',
      headerName: t('tableHeaders.sudAkt'),
      width: 100,
      type: 'date',
      renderCell: (params) => {
        const dateStr = params.row.sudAkt?.createdDate;
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      }
    },
    {
      field: 'Ogohlantish',
      headerName: t('tableHeaders.warning'),
      width: 100,
      type: 'date',
      renderCell: (params) => {
        const dateStr = params.row.warningLetter?.createdDate;
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      }
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/court-service/debitor-abonents', {
        params: {
          page,
          size: pageSize,
          ...filters
        }
      })
      .then(({ data }) => {
        setRows(data.rows.map((row, i) => ({ ...row, i })));
        setTotalRows(data.total);
      })
      .finally(() => setIsLoading(false));
  }, [page, pageSize, refreshState]);
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };
  const handlePaginationChange = (model) => {
    if (model.page !== page) handlePageChange(model.page);
    if (model.pageSize !== pageSize) handlePageSizeChange(model.pageSize);
  };
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}></Grid>
      <Grid item xs={12}>
        <DataGrid
          slots={{
            toolbar: () => <Toolbar filters={filters} lastUpdateDate={lastUpdateDate} />
          }}
          rows={rows}
          columns={columns}
          paginationMode="server"
          rowCount={totalRows}
          loading={isLoading}
          paginationModel={{ page, pageSize }}
          pageSizeOptions={[15, 30, 50, 100]}
          onPaginationModelChange={handlePaginationChange}
        />
      </Grid>
    </Grid>
  );
}

export default DataTable;
