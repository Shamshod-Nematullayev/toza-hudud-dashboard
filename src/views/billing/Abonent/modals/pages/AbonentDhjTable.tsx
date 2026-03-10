import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import api from 'utils/api';
import { useAbonentStore } from '../../abonentStore';
import { Card } from '@mui/material';
import { t } from 'i18next';

function AbonentDhjTable() {
  const { abonentDetails } = useAbonentStore();
  const { dataGridProps, rows } = useServerDataGrid(async ({ limit, page, sortDirection, sortField }) => {
    const data = (
      await api.get('/billing/get-abonent-dxj-by-id', {
        params: {
          residentId: abonentDetails?.id,
          page,
          limit,
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
      data: data.rows
    };
  });
  return (
    <Card sx={{ boxShadow: 4 }}>
      <DataGrid {...dataGridProps} rows={rows} columns={columns} />
    </Card>
  );
}

const columns: GridColDef[] = [
  { field: 'orderNumber', headerName: '№', width: 50 },
  {
    field: 'id',
    headerName: 'ID'
  },
  {
    field: 'period',
    headerName: t('tableHeaders.period'),
    flex: 1
  },
  {
    field: 'inhabitantCount',
    headerName: t('tableHeaders.inhabitantCount')
  },
  {
    field: 'nSaldo',
    headerName: t('tableHeaders.nSaldo')
  },
  {
    field: 'actAmount',
    headerName: t('tableHeaders.actAmount')
  },
  {
    field: 'cashAmount',
    headerName: t('tableHeaders.cashAmount')
  }
];

export default AbonentDhjTable;
