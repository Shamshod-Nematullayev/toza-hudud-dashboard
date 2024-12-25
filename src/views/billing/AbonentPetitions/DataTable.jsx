import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import { useLocalStore } from '.';
import { IconButton } from '@mui/material';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';

function DataTable() {
  const { rows, pageNum, limit, total, setRows, setTotal, documentNumber, setPageNum, setLimit } = useLocalStore();
  const [reloadEffect, reload] = useState((e=false) => (!e))

  useEffect(() => {
    api
      .get('/arizalar', {
        params: {
          page: pageNum,
          limit,
          document_number: documentNumber != "" ? documentNumber : undefined 
        }
      })
      .then(({ data }) => {
        setRows(
          data.data.map((row, i) => ({
            _id: row._id,
            id: row.document_number,
            documentType: row.document_type,
            accountNumber: row.licshet,
            aktSummasi: row.aktSummasi,
            status: row.status
          }))
        );
        setTotal(data.meta.total);
      });
  }, [pageNum, limit, total, documentNumber, reloadEffect]);

  const handleMoveToInboxIconClick = (_id) => {
    // Add your logic here to move the selected row to the Inbox
    api.get("/arizalar/move-to-income/"+ _id)
    reload()
  };
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DataGrid
        columns={[
          { field: 'id', headerName: '№', width: 50 },
          { field: 'documentType', headerName: 'Xujjat turi' },
          { field: 'accountNumber', headerName: 'Hisob raqami', width: 120 },
          { field: 'aktSummasi', headerName: 'akt summa', type: 'number' },
          { field: 'status', headerName: 'status' },
          {field: "actions", headerName: "Harakatlar", renderCell: e => {
            return <IconButton onClick={() => handleMoveToInboxIconClick(e.row._id)}><MoveToInboxOutlinedIcon /></IconButton>
          }}
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
        onPaginationModelChange={newModel => {
          setPageNum(newModel.page + 1);
          setLimit(newModel.pageSize);
        }}
        sx={{
          height: '100%'
        }}
      />
    </div>
  );
}

export default DataTable;
