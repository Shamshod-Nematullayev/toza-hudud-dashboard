import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { IAbonentData, useStore } from './useStore';
import api from 'utils/api';
import { Box, IconButton, Stack, Table, Toolbar, Tooltip, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { colors } from 'store/constant';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import { IRowDhj } from 'types/billing';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';

interface IRow {
  id: number;
  davr: string;
  saldo_n: number;
  nachis: number;
  saldo_k: number;
  akt: number;
  yashovchilar_soni: number;
  allPaymentsSum: number;
}

function DHJTable({ abonentData }: { abonentData: IAbonentData }) {
  const [rowsDhjTable, setRowsDhjTable] = useState<IRow[]>([]);
  const [rowsPreviewTable, setRowsPreviewTable] = useState<IRow[]>([]);
  const store = useStore();
  const { t } = useTranslation();

  const [show, setShow] = useState(false);

  const handleClickShow = () => {
    setShow(!show);
  };

  useEffect(() => {
    if (abonentData.accountNumber) {
      api
        .get('/billing/get-abonent-dxj-by-id', {
          params: {
            residentId: abonentData.id
          }
        })
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

  useEffect(() => {
    if (show && rowsDhjTable.length) {
      const now = new Date();
      const currentTariff = store.hisoblandiJadval.find((t) => t.year === now.getFullYear() && t.month === now.getMonth() + 1);
      const kSaldo =
        Number(store.yashovchiSoniInput) * currentTariff.hisoblandi +
        rowsDhjTable[0].saldo_n -
        rowsDhjTable[0].allPaymentsSum -
        rowsDhjTable[0].akt -
        store.aktSumma.total;
      setRowsPreviewTable([
        {
          id: 1,
          davr: rowsDhjTable[0].davr,
          saldo_n: rowsDhjTable[0].saldo_n,
          nachis: !isNaN(Number(store.yashovchiSoniInput))
            ? Number(store.yashovchiSoniInput) * currentTariff.hisoblandi
            : rowsDhjTable[0].nachis,
          saldo_k: kSaldo,
          akt: -(rowsDhjTable[0].akt + store.aktSumma.total),
          yashovchilar_soni: !isNaN(Number(store.yashovchiSoniInput))
            ? Number(store.yashovchiSoniInput)
            : rowsDhjTable[0].yashovchilar_soni,
          allPaymentsSum: rowsDhjTable[0].allPaymentsSum
        },
        ...rowsDhjTable.slice(1)
      ]);
    } else {
      setRowsPreviewTable(rowsDhjTable);
    }
  }, [show, rowsDhjTable, store.yashovchiSoniInput, store.aktSumma.total]);

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <CompactKeyValue
          data={[
            { key: t('tableHeaders.accountNumber'), value: abonentData.accountNumber },
            { key: t('tableHeaders.fullName'), value: abonentData.fullName }
          ]}
          xs={6}
          md={6}
        />
        <Tooltip title="Oldindan ko'rsatish">
          <IconButton color="primary" onClick={handleClickShow}>
            {show ? <IconEye /> : <IconEyeClosed />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          columns={[
            {
              field: 'id',
              headerName: t('tableHeaders.period'),
              renderCell: (params) => params.row.davr
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

                    const [oy, yil] = params.row.davr.split('.').map(Number);
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
                    <div style={{ zIndex: 1 }}>{params.row.nachis}</div>
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
          rows={rowsPreviewTable}
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
      </Box>
    </Stack>
  );
}

export default DHJTable;
