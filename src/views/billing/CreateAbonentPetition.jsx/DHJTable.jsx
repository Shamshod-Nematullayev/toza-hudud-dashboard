import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import useStore from './useStore';
import api from 'utils/api';
import { Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { colors } from 'store/constant';

function DHJTable({ abonentData, title }) {
  const [rowsDhjTable, setRowsDhjTable] = useState([]);
  const store = useStore();
  const { t } = useTranslation();
  const getClassName = ({ row }, i) => {
    let result = '';
    const item = store.recalculationPeriods[i];
    if (!item) return result;
    let fromMoon = item.startDate.$M,
      fromYear = item.startDate.$y,
      toMoon = item.endDate.$M,
      toYear = item.endDate.$y;
    const [oy, yil] = row.davr.split('.');
    if (((oy - 1 >= fromMoon && yil == fromYear) || yil > fromYear) && ((oy - 1 <= toMoon && yil == toYear) || yil < toYear)) {
      result = 'bg-' + colors[i];
    }
    return result;
  };
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
            {
              field: 'id',
              headerName: t('tableHeaders.period'),
              renderCell: (params) => params.row?.davr,
              cellClassName: (params) => getClassName(params, 0)
            },
            { field: 'saldo_n', headerName: t('tableHeaders.nSaldo'), type: 'number', cellClassName: (params) => getClassName(params, 1) },
            {
              field: 'nachis',
              headerName: t('tableHeaders.nachis'),
              type: 'number',
              cellClassName: (params) => getClassName(params, 2)
            },
            { field: 'saldo_k', headerName: t('tableHeaders.kSaldo'), type: 'number', cellClassName: (params) => getClassName(params, 3) },
            {
              field: 'akt',
              headerName: t('tableHeaders.act'),
              type: 'number',
              width: 50,
              cellClassName: (params) => getClassName(params, 4)
            },
            {
              field: 'allPaymentsSum',
              headerName: t('tableHeaders.income'),
              type: 'number',
              cellClassName: (params) => getClassName(params, 5)
            },
            {
              field: 'yashovchilar_soni',
              headerName: t('tableHeaders.inhabitantCount'),
              type: 'number',
              width: 70,
              align: 'center',
              cellClassName: (params) => getClassName(params, 6)
            }
          ]}
          disableColumnFilter
          disableColumnSorting
          hideFooter
          rows={rowsDhjTable}
          sx={{
            width: '100%',
            height: '100%',
            '.bg-ff0000': {
              backgroundColor: '#ff000050'
            },
            '.bg-00ff00': {
              backgroundColor: '#00ff0050'
            },
            '.bg-0000ff': {
              backgroundColor: '#0000ff50'
            },
            '.bg-ff8000': {
              backgroundColor: '#ff800050'
            },
            '.bg-ffff00': {
              backgroundColor: '#ffff0050'
            },
            '.bg-80ff00': {
              backgroundColor: '#80ff0050'
            },

            '.bg-00ff80': {
              backgroundColor: '#00ff8050'
            },
            '.bg-00ffff': {
              backgroundColor: '#00ffff50'
            },
            '.bg-0080ff': {
              backgroundColor: '#0080ff50'
            },
            '.bg-8000ff': {
              backgroundColor: '#8000ff50'
            },
            '.bg-ff00ff': {
              backgroundColor: '#ff00ff50'
            },
            '.bg-ff0080': {
              backgroundColor: '#ff008050'
            }
          }}
        />
      </div>
    </Stack>
  );
}

export default DHJTable;
