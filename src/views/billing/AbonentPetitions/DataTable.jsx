import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import useStore from './useStore';
import api from 'utils/api';

function DataTable() {
  const { rows, pageNum, limit, total, setRows, setTotal } = useStore();

  useEffect(() => {
    api
      .get('/arizalar', {
        params: {
          page: pageNum,
          limit
        }
      })
      .then(({ data }) => {
        setRows(
          data.data.map((row, i) => ({
            id: row.document_number,
            documentType: row.document_type,
            accountNumber: row.licshet,
            aktSummasi: row.aktSummasi,
            status: row.status
          }))
        );
        setTotal(data.meta.total);
      });
  }, [pageNum, limit, total]);
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DataGrid
        columns={[
          { field: 'id', headerName: '№', width: 50 },
          { field: 'documentType', headerName: 'Xujjat turi' },
          { field: 'accountNumber', headerName: 'Hisob raqami', width: 120 },
          { field: 'aktSummasi', headerName: 'akt summa', type: 'number' },
          { field: 'status', headerName: 'status' }
        ]}
        paginationMode="server"
        filterMode="server"
        disableColumnSorting
        rows={rows}
        rowCount={total}
        initialState={{
          pagination: {
            paginationModel: { page: pageNum - 1, pageSize: limit }
          }
        }}
        sx={{
          height: '100%'
        }}
      />
    </div>
  );
}

export default DataTable;
