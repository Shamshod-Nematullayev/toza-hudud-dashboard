import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import { IconButton, Tooltip } from '@mui/material';

function DataTable({ rows, paging, setPaging, rowsMeta = {} }) {
  const [mahallalar, setMahallalar] = useState([]);

  useEffect(() => {
    api.get('/billing/get-all-active-mfy').then(({ data }) => {
      setMahallalar(data.data);
    });
  }, []);

  const handleClickCancelButton = (document) => {};
  return (
    <DataGrid
      columns={[
        {
          field: 'documentNumber',
          headerName: '№',
          width: 50
        },
        {
          field: 'mahallaId',
          headerName: 'Mahalla nomi',
          width: 150,
          renderCell: ({ row }) => mahallalar.find((m) => m.id === row.mahallaId)?.name
        },
        {
          field: 'date',
          headerName: 'Xujjat sana',
          type: 'date'
        },
        {
          field: 'elements',
          headerName: 'Elementlar soni',
          renderCell: ({ row }) => row.request_ids.length
        },
        {
          field: '_',
          headerName: 'Harakatlar',
          renderCell: ({ row }) => (
            <>
              <Tooltip title={'Bekor qilish'}>
                <IconButton color={'error'}>
                  <DoDisturbAltOutlinedIcon />
                </IconButton>
              </Tooltip>
            </>
          )
        }
      ]}
      rows={rows}
      disableColumnFilter
      disableColumnSorting
      initialState={{
        pagination: {
          paginationModel: paging
        }
      }}
      onPaginationModelChange={(model) => setPaging(model)}
      pageSizeOptions={[15, 30, 50]}
      rowCount={rowsMeta.rowCount}
      paginationMode="server"
    />
  );
}

export default DataTable;
