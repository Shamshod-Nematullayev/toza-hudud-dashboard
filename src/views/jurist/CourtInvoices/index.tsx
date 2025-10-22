import MainCard from 'ui-component/cards/MainCard';
import TableToolbar from './TableToolbar';
import { useState } from 'react';
import DataTableCourtInvoicesData from './DataTableCourtInvoicesData';
import CreateInvoiceModal from './CreateInvoiceModal';

export interface IRow {
  id: number;
  amount: number;
  invoiceStatus: string;
  number: string;
  issued: Date;
  overdue: Date;
}

function CourtInvoices() {
  const [rows, setRows] = useState<IRow[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loaderState, setLoaderState] = useState(false);
  function reload() {
    setLoaderState(!loaderState);
  }
  return (
    <MainCard contentSX={{ minHeight: 'calc(100vh - 150px)' }}>
      {showCreateModal && <CreateInvoiceModal handleClose={() => setShowCreateModal(false)} reload={reload} />}
      <TableToolbar setRows={setRows} rows={rows} checked={checked} openCreateModal={() => setShowCreateModal(true)} reload={reload} />
      <DataTableCourtInvoicesData rows={rows} setRows={setRows} checked={checked} setChecked={setChecked} loaderState={loaderState} />
    </MainCard>
  );
}

export default CourtInvoices;
