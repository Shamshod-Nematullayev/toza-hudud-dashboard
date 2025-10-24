import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';
import { Dispatch, SetStateAction } from 'react';
import { IRow } from '.';
import { getCourtInvoices } from 'services/getCourtInvoices';
import { FetchData, useServerDataGrid } from 'hooks/useServerDataGrid';

function DataTableCourtInvoices({
  status,
  checked,
  setChecked
}: {
  rows: IRow[];
  setRows: Dispatch<SetStateAction<IRow[]>>;
  checked: string[];
  setChecked: Dispatch<SetStateAction<string[]>>;
  loaderState: boolean;
  status: 'All' | 'CREATED' | 'PAID';
}) {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, sortable: false },
    { field: 'number', headerName: t('documentNumber'), flex: 1 },
    { field: 'amount', headerName: t('recalculator.sum'), type: 'number' },
    { field: 'mustPayAmount', headerName: t('tableHeaders.mustPayAmount'), type: 'number' },
    {
      field: 'issued',
      headerName: t('tableHeaders.createdDate'),
      type: 'date',
      valueGetter: (params) => new Date(params)
    },
    { field: 'overdue', headerName: t('tableHeaders.expiresDate'), type: 'date', valueGetter: (params) => new Date(params) },
    { field: 'invoiceStatus', headerName: t('tableHeaders.status') },
    { field: 'court', headerName: t('tableHeaders.court'), flex: 1 },
    { field: 'payer', headerName: t('tableHeaders.payer'), flex: 1 },
    { field: 'forAccount', headerName: t('tableHeaders.forAccount'), flex: 1 }
  ];

  const fetchFunc: FetchData = async ({ page, limit, sortField, sortDirection, filters }) => {
    const res = await getCourtInvoices({
      page,
      limit,
      invoiceStatus: (filters?.status === 'All' ? undefined : filters?.status) as 'CREATED' | 'PAID' | undefined,
      sortField: sortField as any,
      sortDirection
    });

    return {
      data: res.invoices.map((i: any) => ({
        ...i,
        issued: new Date(i.issued),
        amount: i.amount / 100,
        mustPayAmount: i.mustPayAmount / 100
      })),
      meta: res.meta
    };
  };

  const { dataGridProps, rows } = useServerDataGrid(fetchFunc, [], 15, { status });

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <DataGrid
        {...dataGridProps}
        columns={columns}
        rows={rows}
        checkboxSelection
        pageSizeOptions={[15, 30, 50, 100]}
        onRowSelectionModelChange={(rowSelectionModel) => setChecked(rowSelectionModel.map((id) => id.toString()))}
      />
    </div>
  );
}

export default DataTableCourtInvoices;
