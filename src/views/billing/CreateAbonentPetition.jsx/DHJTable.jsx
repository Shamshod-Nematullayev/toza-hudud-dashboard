import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import useStore from './useStore';
import api from 'utils/api';
import { Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function DHJTable({ abonentData, title }) {
  const [rowsDhjTable, setRowsDhjTable] = useState([]);
  const store = useStore();
  const { t } = useTranslation();
  useEffect(() => {
    if (abonentData.accountNumber) {
      api.get('/billing/get-abonent-dxj-by-id/' + abonentData.id).then(({ data }) => {
        if (!data.ok) return toast.error(data.message);
        setRowsDhjTable(
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
        store.setRowsDhjTable(
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
      setRowsDhjTable([]);
      store.setRowsDhjTable([]);
    }
  }, [abonentData]);
  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h3">{title}</Typography>
      <div style={{ height: 'calc(100vh - 300px) ' }}>
        <DataGrid
          columns={[
            { field: 'id', headerName: t('tableHeaders.period'), renderCell: (params) => params.row?.davr },
            { field: 'saldo_n', headerName: t('tableHeaders.nSaldo'), type: 'number' },
            { field: 'nachis', headerName: t('tableHeaders.nachis'), type: 'number' },
            { field: 'saldo_k', headerName: t('tableHeaders.kSaldo'), type: 'number' },
            { field: 'akt', headerName: t('tableHeaders.act'), type: 'number', width: 50 },
            { field: 'allPaymentsSum', headerName: t('tableHeaders.income'), type: 'number' },
            { field: 'yashovchilar_soni', headerName: t('tableHeaders.inhabitantCount'), type: 'number', width: 70, align: 'center' }
          ]}
          disableColumnFilter
          disableColumnSorting
          hideFooter
          rows={rowsDhjTable}
          sx={{
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </Stack>
  );
}

export default DHJTable;
