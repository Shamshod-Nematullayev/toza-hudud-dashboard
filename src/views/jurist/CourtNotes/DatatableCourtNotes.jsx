import { DataGrid } from '@mui/x-data-grid';
import React from 'react';

function DatatableCourtNotes() {
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
      renderCell: () => <div style={{ display: 'flex' }}></div>,
      filterable: false,
      editable: false
    }
  ];
  return (
    <>
      <DataGrid columns={columns} rows={[]} disableColumnSorting disableColumnMenu />
    </>
  );
}

export default DatatableCourtNotes;
