import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import api from 'utils/api';
import { Grid } from '@mui/material';
import ToolBar from '../ToolBar';
import useStore from '../useStore';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { columns } from './columns';
function DataTable() {
  const { rows, pageNum, limit, total, setRows, setTotal, setPageNum, setLimit, setIsLoading, filter, reloadState } = useStore();

  useEffect(() => {
    setIsLoading(true);
    try {
      api
        .get('/arizalar', {
          params: {
            page: pageNum,
            limit,
            ...filter,
            ariza_status: filter.ariza_status === '' ? null : filter.ariza_status
          }
        })
        .then(({ data }) => {
          const rows = data.data.map((row, i) => ({
            _id: row._id,
            id: i,
            documentNumber: row.document_number,
            documentType: t('documentTypes.' + row.document_type),
            accountNumber: row.licshet,
            aktSummasi: row.aktSummasi,
            status: row.status,
            actStatus: row.actStatus,
            fio: row.fio
          }));
          setRows(rows);
          setTotal(data.meta.total);
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error('xatolik kuzatildi');
    }
  }, [pageNum, limit, reloadState, filter, setRows, setTotal, setIsLoading]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <ToolBar />
      </Grid>
      <Grid item xs={12}>
        <DataGrid
          columns={columns()}
          paginationMode="server"
          filterMode="server"
          disableColumnSorting
          disableColumnMenu
          rows={rows}
          rowCount={total}
          initialState={{
            pagination: {
              paginationModel: { page: pageNum - 1, pageSize: limit }
            }
          }}
          onPaginationModelChange={(newModel) => {
            setPageNum(newModel.page + 1);
            setLimit(newModel.pageSize);
          }}
          sx={{
            height: 'calc(100vh - 250px)'
          }}
        />
      </Grid>
    </Grid>
  );
}

export default DataTable;
