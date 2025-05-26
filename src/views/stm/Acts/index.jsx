import { NavigateNext } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { actStatusOptions } from 'store/constant';
import useLoaderStore from 'store/loaderStore';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import Toolbar from './Toolbar';

function Acts() {
  const { t } = useTranslation();
  const columns = [
    { field: 'id', headerName: 'ID', width: 50, renderCell: (row) => row.row.i },
    { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), flex: 1 },
    { field: 'residentFullName', headerName: t('tableHeaders.fullName'), flex: 2 },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.status'),
      flex: 1,
      renderCell: (row) => actStatusOptions.find((s) => s.value == row.row.actStatus).label
    },
    { field: 'amount', headerName: t('tableHeaders.actAmount'), type: 'number', flex: 1 },
    { field: 'amountWithQQS', headerName: t('tableHeaders.amountWithQQS'), flex: 1 },
    { field: 'inhabitantCnt', headerName: t('tableHeaders.inhabitantCount'), width: 50 },
    {
      field: 'checkStatus',
      headerName: t('tableHeaders.checkStatus'),
      flex: 1,
      renderCell: (row) => row.row.onDb.checkStatus || 'Tekshirilmagan'
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions'),
      flex: 1,
      renderCell: (row) => (
        <>
          <Link to={`/stm/actCheck/${row.row.id}`}>
            <IconButton>
              <NavigateNext color="primary" />
            </IconButton>
          </Link>
        </>
      )
    }
  ];
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const { isLoading, setIsLoading } = useLoaderStore();
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    checkStatus: ''
  });

  const params = useParams();

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/acts', { params: { packId: params.packId, page, size: pageSize, ...filters } })
      .then(({ data }) => {
        setRows(data.content.map((row, i) => ({ ...row, i: i + 1 })));
        setTotalRows(data.totalElements);
      })
      .finally(() => setIsLoading(false));
  }, [page, pageSize, filters]);

  const handlePaginationChange = (model) => {
    if (model.page !== page) setPage(model.page);
    if (model.pageSize !== pageSize) setPageSize(model.pageSize);
  };
  return (
    <MainCard>
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{ toolbar: () => <Toolbar selectedRows={selectedRows} filters={filters} setFilters={setFilters} /> }}
        paginationMode="server"
        checkboxSelection
        rowCount={totalRows}
        loading={isLoading}
        paginationModel={{ page, pageSize }}
        pageSizeOptions={[15, 30, 50, 100]}
        onPaginationModelChange={handlePaginationChange}
        onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
        disableColumnSorting
        disableColumnFilter
      />
    </MainCard>
  );
}

export default Acts;
