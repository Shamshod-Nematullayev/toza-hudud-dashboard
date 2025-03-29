import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { toast } from 'react-toastify';

function DataTable({ rows, paging, setPaging, rowsMeta = {}, setRows }) {
  const [mahallalar, setMahallalar] = useState([]);

  useEffect(() => {
    api.get('/billing/get-all-active-mfy').then(({ data }) => {
      setMahallalar(data.data);
    });
  }, []);

  const handleClickCancelButton =async (document) => {
    try {
      const asos = prompt(`Siz haqiqatan ham ushbu (${document.documentNumber}) dalolatnomani bekor qilmoqchimisiz? Bekor qilish sababini yozing`)
      if(asos) {
        await api.put("/yashovchi-soni-xatlov/cancel-document/" + document._id, {
          body: {
            cancelDescription: asos,
          },
        });
       const newRows = rows.map(row => {
        if(row._id === document._id) {
          row.isCancel = true
        }
        return row
       }) 
       setRows(newRows)
       toast.info("Bekor qilindi")
      }
    } catch (error) {
      console.log(error);
      
    }
  };
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
          field: 'status',
          headerName: 'Holat',
          renderCell: ({ row }) => row.isCancel ? 'Bekor qilingan' : "Aktiv"
        },
        {
          field: '_',
          headerName: 'Harakatlar',
          renderCell: ({ row }) => (
            <>
              <Tooltip title={'Bekor qilish'}>
                <IconButton color={'error'} onClick={() => handleClickCancelButton(row)} disabled={row.isCancel}>
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
