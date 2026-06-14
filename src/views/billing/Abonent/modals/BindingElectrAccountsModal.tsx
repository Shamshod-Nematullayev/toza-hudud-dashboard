import { Add, Delete, DeleteOutlined, SaveAlt } from '@mui/icons-material';
import { Button, DialogContent, IconButton, List, ListItem, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';

interface Props {
  open: boolean;
  onClose: () => void;
}
function BindingElectrAccountsModal({ open, onClose }: Props) {
  const [bindedElectrAccounts, setBoundElectrAccounts] = useState<{ _id: string; accountNumber: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await api.get('/abonents/TODO');
      setBoundElectrAccounts(data);
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const { data } = await api.delete(`/abonents/TODO${id}`);
    setBoundElectrAccounts(data);
  };

  const [adding, setAdding] = useState(false);
  const [accountNumberEtk, setAccountNumberEtk] = useState('');
  const [caoto, setCaoto] = useState('');

  const handleAddNewAccount = async () => {
    const { data } = await api.patch('/abonents/TODO', {
      accountNumber: accountNumberEtk,
      electricityCoato: caoto
    });
    setBoundElectrAccounts((prev) => [...prev, data]);
  };
  return (
    <DraggableDialog title="Bog'langan elektr hisob raqamlari" onClose={onClose} open={open}>
      <DialogContent>
        <List>
          {bindedElectrAccounts.map((row) => (
            <>
              <ListItem key={row._id}>
                {row.accountNumber}{' '}
                <IconButton onClick={() => handleDelete(row._id)}>
                  <DeleteOutlined />
                </IconButton>
              </ListItem>
            </>
          ))}
        </List>
        {adding && (
          <>
            <TextField label={t('tableHeaders.electricityCoato')} value={caoto} onChange={(e) => setCaoto(e.target.value)} />
            <TextField
              label={t('tableHeaders.electricityAccountNumber')}
              value={accountNumberEtk}
              onChange={(e) => setAccountNumberEtk(e.target.value)}
            />
            <IconButton color="primary" onClick={handleAddNewAccount}>
              <SaveAlt />
            </IconButton>
          </>
        )}
        <Button color="success" onClick={() => setAdding(true)} startIcon={<Add />}>
          {t('buttons.add')}
        </Button>
      </DialogContent>
    </DraggableDialog>
  );
}

export default BindingElectrAccountsModal;
