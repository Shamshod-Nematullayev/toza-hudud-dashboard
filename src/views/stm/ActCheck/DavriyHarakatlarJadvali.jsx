import { DataGrid } from '@mui/x-data-grid';
import React from 'react';

function DavriyHarakatlarJadvali({ rows }) {
  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'davr', headerName: 'Davr', flex: 1 },
    { field: 'hisoblandi', headerName: 'Hisoblandi', flex: 1 },
    { field: 'tushum', headerName: 'Tushum', flex: 1 },
    { field: 'act', headerName: 'Akt', flex: 1 },
    { field: 'yashovchilar_soni', headerName: 'Yashovchilar soni', flex: 1 },
    { field: 'saldo_oxiri', headerName: 'Saldo oxiri', flex: 1 }
  ];
  return <DataGrid hideFooter rows={rows} columns={columns} />;
}

export default DavriyHarakatlarJadvali;
