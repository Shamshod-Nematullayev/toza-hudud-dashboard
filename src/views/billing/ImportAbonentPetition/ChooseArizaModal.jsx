import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import { useTranslation } from 'react-i18next';

function ChooseArizaModal({ rows = [], handleClose, showDialog, setAriza }) {
  const { t } = useTranslation();
  const columns = [
    { field: 'id', headerName: t('tableHeaders.actions'), width: 30, renderCell: (row) => row.row.id + 1 },
    { field: 'licshet', headerName: t('tableHeaders.accountNumber'), flex: 1, minWidth: 120 },
    { field: 'document_type', headerName: t('tableHeaders.documentType') },
    { field: 'fullName', headerName: t('tableHeaders.fullName'), flex: 1 }
  ];
  const handlePickAriza = ({ row }) => {
    console.log(row);
    setAriza(row);
    handleClose();
  };
  return (
    <Dialog open={showDialog} onClose={handleClose}>
      <DialogTitle>Kerakli elementni tanlang</DialogTitle>
      <DialogContent>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: rows.indexOf(row) }))}
          columns={columns}
          sx={{ height: '0', maxHeight: 500 }}
          hideFooter
          onRowDoubleClick={handlePickAriza}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ChooseArizaModal;
