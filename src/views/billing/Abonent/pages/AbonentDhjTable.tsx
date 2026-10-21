import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useMemo } from 'react';
import { useAbonentStore } from '../hooks/abonentStore';
import { alpha, Card } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAbonentLogic } from '../hooks/useAbonentLogic';

function AbonentDhjTable() {
  const { t } = useTranslation();
  const { residentId } = useAbonentLogic();
  const dhjRows = useAbonentStore((s) => s.dhjRows);
  const dhjRowsResidentId = useAbonentStore((s) => s.dhjRowsResidentId);
  const dhjRowsLoading = useAbonentStore((s) => s.dhjRowsLoading);
  const getDhjRows = useAbonentStore((s) => s.getDhjRows);

  // DHJ bir marta to'liq yuklanadi; sahifa almashtirish va tabga qaytish qayta so'rov yubormaydi
  useEffect(() => {
    if (Number.isNaN(residentId) || dhjRowsResidentId === residentId) return;
    getDhjRows(residentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId]);

  const rows = useMemo(
    () =>
      dhjRowsResidentId === residentId
        ? dhjRows.map((row, index) => ({
            ...row,
            orderNumber: index + 1,
            allPaymentsAmount: row.cashAmount + row.eMoneyAmount + row.munisAmount + row.q1031Amount
          }))
        : [],
    [dhjRows, dhjRowsResidentId, residentId]
  );

  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: '№', width: 50 },
    {
      field: 'id',
      headerName: 'ID'
    },
    {
      field: 'period',
      headerName: t('tableHeaders.period'),
      align: 'right'
    },
    {
      field: 'inhabitantCount',
      headerName: t('tableHeaders.inhabitantCount'),
      type: 'number'
    },
    {
      field: 'nSaldo',
      headerName: t('tableHeaders.nSaldo'),
      type: 'number'
    },
    {
      field: 'accrual',
      headerName: t('tableHeaders.nachis'),
      type: 'number'
    },
    {
      field: 'actAmount',
      headerName: t('tableHeaders.actAmount'),
      type: 'number'
    },
    {
      field: 'cashAmount',
      headerName: t('tableHeaders.cashIncome'),
      type: 'number'
    },
    {
      field: 'eMoneyAmount',
      headerName: t('tableHeaders.eMoneyAmount'),
      type: 'number'
    },
    {
      field: 'munisAmount',
      headerName: t('tableHeaders.munisAmount'),
      type: 'number'
    },
    {
      field: 'q1031Amount',
      headerName: t('tableHeaders.q1031Amount'),
      type: 'number'
    },
    {
      field: 'allPaymentsAmount',
      headerName: t('tableHeaders.allPaymentsAmount'),
      type: 'number',
      flex: 1
    },
    {
      field: 'kSaldo',
      headerName: t('tableHeaders.kSaldo'),
      flex: 1,
      minWidth: 100,
      type: 'number',
      renderCell: (e) => (
        <span
          style={{
            fontWeight: 600,
            color: Number(e.value) > 0 ? '#d32f2f' : '#2e7d32'
          }}
        >
          {e.value ? Number(e.value).toLocaleString('uz-UZ') : '0'}
        </span>
      )
    },
    {
      field: 'penaltyFee',
      headerName: t('tableHeaders.penaltyFee'),
      type: 'number'
    }
  ];
  return (
    <Card sx={{ boxShadow: 4 }}>
      <DataGrid
        rows={rows}
        loading={dhjRowsLoading || dhjRowsResidentId !== residentId}
        columns={columns}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
        pageSizeOptions={[15, 50, 100]}
        disableColumnSorting
        disableColumnMenu
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row')}
        sx={{
          '& .MuiDataGrid-columnHeaderTitle': {
            whiteSpace: 'normal',
            lineHeight: 'normal'
          },
          '& .even-row': {
            backgroundColor: 'background.paper', // Juft qatorlar uchun och kulrang
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.3) // Sichqoncha ustiga kelganda
            }
          },
          '& .odd-row': {
            backgroundColor: 'background.default', // Toq qatorlar uchun och kulrang
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.3) // Sichqoncha ustiga kelganda
            }
          }
        }}
      />
    </Card>
  );
}

export default AbonentDhjTable;
