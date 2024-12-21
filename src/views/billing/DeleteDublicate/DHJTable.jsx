import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import { Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';

function DHJTable({ accountNumber, abonentId, title }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (accountNumber.length === 12) {
      api.get('/billing/get-abonent-dxj-by-id/' + abonentId.id).then(({ data }) => {
        if (!data.ok) return toast.error(data.message);
        setRows(
          data.rows.map((row, i) => ({
            id: i + 1,
            davr: row.period,
            saldo_n: row.nSaldo,
            nachis: row.accrual,
            saldo_k: row.kSaldo,
            akt: row.actAmount,
            yashovchilar_soni: row.inhabitantCount,
            allPaymentsSum: row.allPaymentsSum
          }))
        );
      });
    } else {
      setRows([]);
    }
  }, [accountNumber]);
  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', margin: 'auto 10px', minHeight: 700, maxHeight: '70vh' }}>
      <Typography variant="h3">{title}</Typography>
      <div style={{ width: '100%', height: '60vh' }}>
        <DataGrid
          columns={[
            { field: 'id', headerName: 't/r', width: 10 },
            { field: 'davr', headerName: 'davr' },
            { field: 'saldo_n', headerName: 'Saldo boshi', type: 'number' },
            { field: 'nachis', headerName: 'Hisoblandi', type: 'number' },
            { field: 'saldo_k', headerName: 'Saldo oxiri', type: 'number' },
            { field: 'akt', headerName: 'Akt', type: 'number', width: 50 },
            { field: 'yashovchilar_soni', headerName: 'Yashovchi soni', type: 'number', width: 70, align: 'center' }
          ]}
          disableColumnFilter
          disableColumnSorting
          hideFooter
          rows={rows}
          sx={{
            margin: '25px auto'
          }}
        />
      </div>
    </Stack>
  );
}

export default DHJTable;
