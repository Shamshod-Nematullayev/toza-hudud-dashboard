import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import Toolbar from './Toolbar';

function DavriyHarakatlarJadvali({ rows, act, setAct }) {
  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'davr', headerName: 'Davr', flex: 1 },
    { field: 'hisoblandi', headerName: 'Hisoblandi', flex: 1 },
    { field: 'tushum', headerName: 'Tushum', flex: 1 },
    { field: 'act', headerName: 'Akt', flex: 1 },
    { field: 'yashovchilar_soni', headerName: 'Yashovchilar soni', flex: 1 },
    { field: 'saldo_oxiri', headerName: 'Saldo oxiri', flex: 1 }
  ];
  return (
    <DataGrid
      hideFooter
      rows={rows}
      columns={columns}
      slots={{ toolbar: () => <Toolbar act={act} setAct={setAct} /> }}
      sx={{ height: '100%', maxHeight: 'calc(100vh - 100px)' }}
    />
  );
}

export default DavriyHarakatlarJadvali;
