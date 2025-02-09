import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import Tools from './Tools';

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 5
  },
  {
    field: 'davr',
    headerName: 'Davr',
    width: 80
  },
  {
    field: 'hisoblandi',
    headerName: 'Hisoblandi',
    width: 70,
    type: 'number'
  },
  {
    field: 'tushum',
    headerName: 'Tushum',
    width: 70,
    type: 'number'
  },
  {
    field: 'act',
    headerName: 'Akt',
    width: 70,
    type: 'number'
  },
  {
    field: 'saldo_oxiri',
    headerName: 'Saldo oxiri',
    width: 70,
    type: 'number'
  }
];

function DHJTable({ rows = [] }) {
  return (
    <>
      <Tools />
      <DataGrid columns={columns} rows={rows} hideFooter />
    </>
  );
}

export default DHJTable;
