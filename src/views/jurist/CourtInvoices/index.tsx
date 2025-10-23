import MainCard from 'ui-component/cards/MainCard';
import TableToolbar from './TableToolbar';
import { useState } from 'react';
import DataTableCourtInvoices from './DataTableCourtInvoices';
import CreateInvoiceModal from './CreateInvoiceModal';
import { ICourtInvoice } from 'services/getCourtInvoices';
import { GridSortDirection } from '@mui/x-data-grid';

export interface IRow extends ICourtInvoice {
  id: number;
}

function CourtInvoices() {
  const [rows, setRows] = useState<IRow[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loaderState, setLoaderState] = useState(false);
  const [status, setStatus] = useState<'All' | 'CREATED' | 'PAID'>('All');

  function reload() {
    setLoaderState(!loaderState);
  }
  return (
    <MainCard contentSX={{ minHeight: 'calc(100vh - 150px)' }}>
      {showCreateModal && <CreateInvoiceModal handleClose={() => setShowCreateModal(false)} reload={reload} />}
      <TableToolbar
        setRows={setRows}
        rows={rows}
        checked={checked}
        openCreateModal={() => setShowCreateModal(true)}
        reload={reload}
        status={status}
        setStatus={setStatus}
      />
      <DataTableCourtInvoices
        rows={rows}
        setRows={setRows}
        checked={checked}
        setChecked={setChecked}
        loaderState={loaderState}
        status={status}
      />
    </MainCard>
  );
}

export default CourtInvoices;
