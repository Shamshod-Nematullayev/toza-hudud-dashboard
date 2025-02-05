import { IconButton } from '@mui/material';
import { DataGrid, GridDeleteIcon } from '@mui/x-data-grid';
import React, { useState } from 'react';

function DatatableCourtNotes() {
  const [rows, setRows] = useState();
  const handleClickDeleteButton = () => {
    // Your delete logic here
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
      width: 150
    },
    {
      field: 'inspector_name',
      headerName: 'Nazoratchi',
      width: 150
    },
    {
      field: 'status',
      headerName: 'status'
    },
    {
      field: 'actions',
      headerName: 'Harakatlar',
      width: 100,
      renderCell: () => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={handleClickDeleteButton} sx={{ color: 'error.main' }}>
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
      <DataGrid columns={columns} rows={[{ id: '1' }]} disableColumnSorting disableColumnMenu />
    </>
  );
}

export default DatatableCourtNotes;
