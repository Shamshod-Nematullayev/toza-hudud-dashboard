import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IRow } from '.';
import { getCourtInvoices } from 'services/getCourtInvoices';

function DataTableCourtInvoicesData({
  rows,
  setRows,
  checked,
  setChecked,
  loaderState
}: {
  rows: IRow[];
  setRows: Dispatch<SetStateAction<IRow[]>>;
  checked: string[];
  setChecked: Dispatch<SetStateAction<string[]>>;
  loaderState: boolean;
}) {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'number', headerName: t('documentNumber') },
    { field: 'amount', headerName: t('recalculator.sum'), type: 'number' },
    { field: 'issued', headerName: t('tableHeaders.createdDate'), type: 'date' },
    { field: 'overdue', headerName: t('tableHeaders.expiresDate'), type: 'date' },
    { field: 'invoiceStatus', headerName: t('tableHeaders.status') }
  ];

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCourtInvoices();

      setRows(response.invoices.map((invoice, index) => ({ ...invoice, id: index + 1 })));
      setTotal(response.meta.total);
    };

    fetchData();
  }, [loaderState]);

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        rowCount={total}
        checkboxSelection
        onRowSelectionModelChange={(rowSelectionModel) => setChecked(rowSelectionModel.map((id) => id.toString()))}
      />
    </div>
  );
}

export default DataTableCourtInvoicesData;
