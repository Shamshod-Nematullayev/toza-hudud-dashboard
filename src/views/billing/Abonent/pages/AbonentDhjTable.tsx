import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { DHJ_PREVIEW_SIZE, useAbonentStore } from '../hooks/abonentStore';
import { alpha, Card, LinearProgress } from '@mui/material';
import { DHJRow } from 'types/billing';
import { useTranslation } from 'react-i18next';
import { useAbonentLogic } from '../hooks/useAbonentLogic';

function AbonentDhjTable() {
  const { t } = useTranslation();
  const { residentId } = useAbonentLogic();
  const dhjRows = useAbonentStore((s) => s.dhjRows);
  const dhjRowsResidentId = useAbonentStore((s) => s.dhjRowsResidentId);
  const dhjRowsLoading = useAbonentStore((s) => s.dhjRowsLoading);
  const dhjPreview = useAbonentStore((s) => s.dhjPreview);
  const getDhjRows = useAbonentStore((s) => s.getDhjRows);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: DHJ_PREVIEW_SIZE });

  // DHJ bir marta to'liq yuklanadi; sahifa almashtirish va tabga qaytish qayta so'rov yubormaydi
  useEffect(() => {
    if (Number.isNaN(residentId) || dhjRowsResidentId === residentId) return;
    getDhjRows(residentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [residentId]);

  const isComplete = dhjRowsResidentId === residentId;
  // To'liq ro'yxat kelguncha birinchi qatorlarni ko'rsatamiz (sahifalash server rejimida, jami soni bilan)
  const partial = !isComplete && dhjPreview?.residentId === residentId ? dhjPreview : null;

  const rows = useMemo(() => {
    const toGridRows = (list: DHJRow[]) =>
      list.map((row, index) => ({
        ...row,
        orderNumber: index + 1,
        allPaymentsAmount: row.cashAmount + row.eMoneyAmount + row.munisAmount + row.q1031Amount
      }));
    if (isComplete) return toGridRows(dhjRows);
    if (!partial) return [];
    // Joriy sahifa birinchi qatorlar ichida bo'lsagina ko'rsatamiz, aks holda to'liq ro'yxatni kutamiz
    const start = paginationModel.page * paginationModel.pageSize;
    const end = Math.min(start + paginationModel.pageSize, partial.total);
    return end <= partial.rows.length ? toGridRows(partial.rows).slice(start, end) : [];
  }, [isComplete, dhjRows, partial, paginationModel]);

  const isPartialShown = Boolean(partial) && rows.length > 0;

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
    <Card sx={{ boxShadow: 4, position: 'relative' }}>
      {isPartialShown && <LinearProgress color="secondary" sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 1 }} />}
      <DataGrid
        rows={rows}
        loading={isPartialShown ? false : dhjRowsLoading || !isComplete}
        columns={columns}
        paginationMode={partial ? 'server' : 'client'}
        rowCount={partial ? partial.total : undefined}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
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
