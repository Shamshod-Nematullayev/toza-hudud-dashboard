import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import useLoaderStore from 'store/loaderStore';
import ToolBar from './ToolBar';

function ReportsTable() {
  const { t } = useTranslation();
  const { isLoading, setIsLoading } = useLoaderStore();
  const columns = [
    { field: 'id', headerName: 'ID', width: 50, renderCell: (row) => row.row.i + 1 },
    { field: 'name', headerName: t('tableHeaders.fullName'), width: 150, flex: 1 },
    { field: 'pnflConfirmed', headerName: t('tableHeaders.allPnflCount'), flex: 1 },
    { field: 'pnflConfirmedByDate', headerName: t('tableHeaders.onPeriodPnflCount'), flex: 1, type: 'number' },
    { field: 'etkConfirmed', headerName: t('tableHeaders.allEtkCount'), flex: 1, type: 'number' },
    { field: 'etkConfirmedByDate', headerName: t('tableHeaders.onPeriodEtkCount'), flex: 1, type: 'number' }
  ];
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshState, setRefreshState] = useState(false);
  const [allRowsCount, setAllRowsCount] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null
  });
  useEffect(() => {
    setIsLoading(true);
    api
      .get('/reports/confirmed-abonentdata-by-inspectors', {
        params: {
          page,
          size: pageSize,
          ...filters
        }
      })
      .then(({ data }) => {
        setRows(data.map((row, i) => ({ ...row, i })));
      })
      .finally(() => setIsLoading(false));
  }, [page, pageSize, refreshState]);
  const refreshTable = () => setRefreshState(!refreshState);
  return (
    <div
      style={{
        height: '100%'
      }}
    >
      <DataGrid
        columns={columns}
        rows={rows}
        sx={{
          height: 'calc(100vh - 160px)'
        }}
        loading={isLoading}
        paginationMode="server"
        rowCount={allRowsCount}
        paginationModel={{ page, pageSize }}
        pageSizeOptions={[15, 30, 50]}
        slots={{ toolbar: () => <ToolBar filters={filters} setFilters={setFilters} refreshTable={refreshTable} /> }}
        onPaginationModelChange={(model) => {
          setPage(model.page + 1);
          setPageSize(model.pageSize);
        }}
      />
    </div>
  );
}

export default ReportsTable;
