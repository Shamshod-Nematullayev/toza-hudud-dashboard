import React, { Dispatch, SetStateAction } from 'react';
import { IRow } from '.';
import { Button, Toolbar } from '@mui/material';
import { t } from 'i18next';
import { Add, Refresh } from '@mui/icons-material';

function TableToolbar({
  rows,
  setRows,
  checked,
  openCreateModal,
  reload
}: {
  rows: IRow[];
  setRows: Dispatch<SetStateAction<IRow[]>>;
  checked: string[];
  openCreateModal: () => void;
  reload: () => void;
}) {
  const handleClickRefresh = async () => {
    // TODO
  };

  const handleClickCreate = async () => {
    openCreateModal();
  };

  return (
    <Toolbar sx={{ gap: '5px' }}>
      <Button startIcon={<Add />} color="success" variant="contained" onClick={handleClickCreate}>
        {t('buttons.create')}
      </Button>
      <Button startIcon={<Refresh />} color="primary" variant="contained" disabled={checked.length === 0} onClick={handleClickRefresh}>
        {t('buttons.refresh')}
      </Button>
    </Toolbar>
  );
}

export default TableToolbar;
