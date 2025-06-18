import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useStore } from './useStore';
import api from 'utils/api';
import { Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { colors } from 'store/constant';

export interface IRowDhj {
  accountNumber: string;
  accrual: number;
  actAmount: number;
  allPaymentsSum: number;
  cashAmount: number;
  eMoneyAmount: number;
  frozenActAmount: number;
  frozenDebtSettlement: any;
  frozenKSaldo: number;
  frozenNSaldo: number;
  frozenRevenue: number;
  god: number;
  id: number;
  inhabitantCount: number;
  kSaldo: number;
  kSaldoDt: number;
  kSaldoKt: number;
  mes: number;
  munisAmount: number;
  nSaldo: number;
  nSaldoDt: number;
  nSaldoKt: number;
  organizationId: any;
  penaltyFee: number;
  period: string;
  q1031Amount: number;
  residentId: number;
  tariffId: any;
}

function DHJTable({ abonentData, title }: { abonentData: any; title: string }) {
  const [rowsDhjTable, setRowsDhjTable] = useState([]);
  const store = useStore();
  const { t } = useTranslation();
  useEffect(() => {
    if (abonentData.accountNumber) {
      api
        .get('/billing/get-abonent-dxj-by-id/' + abonentData.id)
        .then(({ data }: { data: { ok: boolean; message: string; rows: IRowDhj[] } }) => {
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
              headerName: t('tableHeaders.period')
            },
            { field: 'saldo_n', headerName: t('tableHeaders.nSaldo'), type: 'number' },
            {
              field: 'nachis',
              headerName: t('tableHeaders.nachis'),
              type: 'number',
              renderCell: (params) => {
                // Har bir davrga mos rangli indikatorlar
                const matchedColors = store.recalculationPeriods
                  .map(({ startDate, endDate }, index) => {
                    const fromMoon = startDate.date() > 15 ? startDate.month() + 1 : startDate.month();
                    const fromYear = startDate.year();
                    const toMoon = endDate.date() > 15 ? endDate.month() : endDate.month() - 1;
                    const toYear = endDate.year();

                    const [oy, yil] = params.row.davr.split('.');
                    if (
                      ((oy - 1 >= fromMoon && yil == fromYear) || yil > fromYear) &&
                      ((oy - 1 <= toMoon && yil == toYear) || yil < toYear)
                    ) {
                      return '#' + colors[index] + '50';
                    }

                    const inRange =
                      (yil > fromYear || (yil === fromYear && oy >= fromMoon)) && (yil < toYear || (yil === toYear && oy <= toMoon));

                    return inRange ? colors[index] : null;
                  })
                  .filter(Boolean);

                return (
                  <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', overflow: 'visible' }}>
                    <div style={{ zIndex: 1 }}>{params.row.davr}</div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row-reverse',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 0,
                        height: '100%',
                        width: '100%'
                      }}
                    >
                      {matchedColors.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: item,
                            // width: '100%',
                            height: '100%',
                            flex: 1
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              }
            },
            { field: 'saldo_k', headerName: t('tableHeaders.kSaldo'), type: 'number' },
            {
              field: 'akt',
              headerName: t('tableHeaders.act'),
              type: 'number',
              width: 50
            },
            {
              field: 'allPaymentsSum',
              headerName: t('tableHeaders.income'),
              type: 'number'
            },
            {
              field: 'yashovchilar_soni',
              headerName: t('tableHeaders.inhabitantCount'),
              type: 'number',
              width: 70,
              align: 'center'
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
