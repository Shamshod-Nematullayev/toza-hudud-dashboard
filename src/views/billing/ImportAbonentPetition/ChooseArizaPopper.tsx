import React from 'react';
import { Popper, Paper, ClickAwayListener } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import Transitions from 'ui-component/extended/Transitions';

function ChooseArizaPopper({
  anchorEl,
  open,
  handleClose,
  rows = [],
  setAriza
}: {
  anchorEl: any;
  open: boolean;
  handleClose: () => void;
  rows: any[];
  setAriza: any;
}) {
  const { t } = useTranslation();

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '№',
      width: 30,
      renderCell: (row) => row.row.id + 1
    },
    { field: 'licshet', headerName: t('tableHeaders.accountNumber'), flex: 1, minWidth: 120 },
    { field: 'document_type', headerName: t('tableHeaders.documentType') },
    { field: 'fullName', headerName: t('tableHeaders.fullName'), flex: 1 }
  ];

  const handlePickAriza = ({ row }: { row: any }) => {
    setAriza(row);
    handleClose();
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="top-start"
      style={{ zIndex: 1300 }}
      // transition
      // disablePortal
      popperOptions={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 20]
            }
          }
        ]
      }}
    >
      {({ TransitionProps }) => (
        <Transitions position={'top'} in={open} {...TransitionProps}>
          <ClickAwayListener onClickAway={handleClose}>
            <Paper sx={{ width: 400, height: 400, overflow: 'auto' }}>
              <DataGrid
                rows={rows.map((row, index) => ({ ...row, id: index }))}
                columns={columns}
                hideFooter
                onRowDoubleClick={handlePickAriza}
                sx={{ height: '100%' }}
              />
            </Paper>
          </ClickAwayListener>
        </Transitions>
      )}
    </Popper>
  );
}

export default ChooseArizaPopper;
