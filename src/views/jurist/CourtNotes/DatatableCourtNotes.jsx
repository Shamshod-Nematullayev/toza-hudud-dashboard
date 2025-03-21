import { IconButton } from '@mui/material';
import { DataGrid, GridDeleteIcon } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import useStore from './useStore';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';

function DatatableCourtNotes() {
  const { filters, setSelectedRows } = useStore();
  const [rows, setRows] = useState();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const { setIsLoading } = useLoaderStore();
  // ===========EFFECTS=============
  useEffect(() => {
    api
      .get('/targets', {
        params: {
          page: page,
          limit: pageSize,
          status: 'yangi',
          ...filters
        }
      })
      .then(({ data }) => {
        setRows(data.data.map((row, i) => ({ id: i + 1, ...row })));
        setTotalRows(data.meta.total);
      });
  }, [page, pageSize, filters]);
  const handleClickDeleteButton = async (row) => {
    if (confirm(`Haqiqatdan ham ${row.fullName} (${row.accountNumber})ni bekor qilmoqchimisiz?`)) {
      setIsLoading(true);
      try {
        await api.patch('/targets/cancel/' + row._id);
        setRows(
          rows.map((r) => {
            if (r.id === row.id) {
              return { ...r, status: 'bekor_qilingan' };
            } else {
              return r;
            }
          })
        );
        toast.success('Amaliyot bajarildi!');
      } catch (error) {
        console.error(error);
        toast.error('Xatolik yuz berdi!');
      } finally {
        setIsLoading(false);
      }
    }
  };
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 50
    },
    {
      field: 'fullName',
      headerName: 'F. I. O.',
      width: 200
    },
    {
      field: 'inspector_name',
      headerName: 'Nazoratchi',
      width: 200
    },
    {
      field: 'status',
      headerName: 'status'
    },
    {
      field: 'actions',
      headerName: 'Harakatlar',
      width: 100,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={() => handleClickDeleteButton(row)} sx={{ color: 'error.main' }}>
            <GridDeleteIcon />
          </IconButton>
        </div>
      ),
      filterable: false,
      editable: false
    }
  ];
  return (
    <>
      <DataGrid
        columns={columns}
        rows={rows}
        checkboxSelection
        disableColumnSorting
        disableColumnMenu
        paginationMode="server"
        initialState={{ pagination: { page: 0, paginationModel: { pageSize } } }}
        rowCount={totalRows}
        onRowSelectionModelChange={(rowSelectionModel) => setSelectedRows(rows.filter((row) => rowSelectionModel.includes(row.id)))}
        onPaginationModelChange={(newPaginationModel) => {
          setPage(newPaginationModel.page);
          setPageSize(newPaginationModel.pageSize);
        }}
      />
    </>
  );
}

export default DatatableCourtNotes;
