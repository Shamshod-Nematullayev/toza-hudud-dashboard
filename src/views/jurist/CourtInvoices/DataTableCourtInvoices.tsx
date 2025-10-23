import { DataGrid, GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { t } from 'i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IRow } from '.';
import { getCourtInvoices } from 'services/getCourtInvoices';

interface ISortModel {
  field:
    | string
    | 'amount'
    | 'court'
    | 'courtId'
    | 'forAccount'
    | 'mustPayAmount'
    | 'issued'
    | 'number'
    | 'payer'
    | 'invoiceStatus'
    | 'overdue';
  sort: GridSortDirection;
}

function DataTableCourtInvoices({
  rows,
  setRows,
  checked,
  setChecked,
  loaderState,
  status
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

  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 });
  const [sortModel, setSortModel] = useState<ISortModel[]>([{ field: 'issued', sort: 'desc' }]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCourtInvoices({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        invoiceStatus: status !== 'All' ? status : undefined,
        sortDirection: sortModel[0].sort,
        sortField: sortModel[0].field as any
      });

      setRows(
        response.invoices.map((invoice, index) => ({
          ...invoice,
          // issued: new Date(invoice.issued),
          // overdue: invoice.overdue ? new Date(invoice.overdue) : null,
          amount: invoice.amount / 100,
          mustPayAmount: invoice.mustPayAmount / 100,
          id: index + 1
        }))
      );
      // setTotal(response.meta.total);
    };

    fetchData();
  }, [loaderState, status, paginationModel.page, paginationModel.pageSize, JSON.stringify(sortModel)]);

  const fetchData = async ({ page, limit, sortField, sortDirection, f }: any) => {
    const res = await getCourtInvoices({
      page,
      limit,
      invoiceStatus: status !== 'All' ? status : undefined,
      sortField,
      sortDirection
    });

    return {
      data: res.invoices.map((i: any) => ({
        ...i,
        issued: new Date(i.issued),
        amount: i.amount / 100
      })),
      total: res.meta.total
    };
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        rowCount={total}
        checkboxSelection
        initialState={{
          pagination: {
            paginationModel
          }
        }}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        pageSizeOptions={[15, 30, 50, 100]}
        paginationMode="server"
        sortingMode="server"
        disableColumnFilter
        onRowSelectionModelChange={(rowSelectionModel) => setChecked(rowSelectionModel.map((id) => id.toString()))}
        onPaginationModelChange={(paginationModel) => {
          setPaginationModel(paginationModel);
        }}
      />
    </div>
  );
}

export default DataTableCourtInvoices;
