import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import api from 'utils/api';
import { useAbonentStore } from '../hooks/abonentStore';
import { alpha, Card } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import { IRowDhj } from 'types/billing';

function AbonentDhjTable() {
  const { t } = useTranslation();
  const { residentId } = useAbonentLogic();
  const { dataGridProps } = useServerDataGrid(async ({ limit, page, sortDirection, sortField }) => {
    const data = (
      await api.get('/billing/get-abonent-dxj-by-id', {
        params: {
          residentId,
          page,
          size: limit,
          sortField,
          sortDirection
        }
      })
    ).data;
    return {
      meta: {
        limit,
        page: data.meta.page,
        total: data.meta.total
      },
      data: data.rows.map((row: IRowDhj, index: number) => ({
        ...row,
        orderNumber: (page - 1) * limit + index + 1,
        allPaymentsAmount: row.cashAmount + row.eMoneyAmount + row.munisAmount + row.q1031Amount
      }))
    };
  });
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
        {...dataGridProps}
        columns={columns}
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
