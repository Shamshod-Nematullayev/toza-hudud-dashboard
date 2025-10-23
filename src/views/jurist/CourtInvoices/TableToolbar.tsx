import { Dispatch, SetStateAction } from 'react';
import { IRow } from '.';
import { Button, FormControl, InputLabel, MenuItem, Select, Toolbar } from '@mui/material';
import { t } from 'i18next';
import { Add, Refresh } from '@mui/icons-material';
import useLoaderStore from 'store/loaderStore';
import { checkCourtInvoicesStatus } from 'services/checkCourtInvoicesStatus';

function TableToolbar({
  rows,
  setRows,
  checked,
  openCreateModal,
  reload,
  status,
  setStatus
}: {
  rows: IRow[];
  setRows: Dispatch<SetStateAction<IRow[]>>;
  checked: string[];
  openCreateModal: () => void;
  reload: () => void;
  status: string;
  setStatus: (status: 'All' | 'CREATED' | 'PAID') => void;
}) {
  const { setIsLoading } = useLoaderStore();

  const handleClickRefresh = async () => {
    try {
      setIsLoading(true);
      await checkCourtInvoicesStatus({ invoiceIds: rows.filter((row) => checked.includes(row.id.toString())).map((row) => row._id) });
      reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
      <FormControl sx={{ minWidth: '100px' }}>
        <InputLabel id="standard-label">{t('tableHeaders.status')}</InputLabel>
        <Select
          labelId="standard-label"
          label={t('tableHeaders.status')}
          value={status}
          onChange={(e) => setStatus(e.target.value as 'All' | 'CREATED' | 'PAID')}
        >
          <MenuItem value={'All'}>{t('all')}</MenuItem>
          <MenuItem value={'CREATED'}>{t('invoiceStatus.CREATED')}</MenuItem>
          <MenuItem value={'PAID'}>{t('invoiceStatus.PAID')}</MenuItem>
        </Select>
      </FormControl>
    </Toolbar>
  );
}

export default TableToolbar;
