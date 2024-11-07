import { DataGrid } from '@mui/x-data-grid';
import React, { useState } from 'react';

function DHJTable() {
  const [rows, setRows] = useState();
  return (
    <DataGrid
      columns={[
        { field: 'id', headerName: 't/r', width: 10 },
        { field: 'davr', headerName: 'davr' },
        { field: 'saldo_n', headerName: 'saldo boshi', type: 'number' },
        { field: 'nachis', headerName: 'Hisoblandi', type: 'number' },
        { field: 'saldo_k', headerName: 'Saldo oxiri', type: 'number' },
        { field: 'akt', headerName: 'Akt', type: 'number' },
        { field: 'yashovchilar_soni', headerName: 'Yashovchi soni', type: 'number', width: 10 }
      ]}
      disableColumnFilter
      disableColumnSorting
      //   hideFooter
      rows={rows}
      style={{ margin: '25px auto', height: '100%' }}
    />
  );
}

export default DHJTable;
