import { Add, Delete, ElectricBolt, Close } from '@mui/icons-material';
import {
  Button,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { useAbonentStore } from '../hooks/abonentStore';
import { toast } from 'react-toastify';
import { HETSuccessResponse } from '../types';
import { CompactKeyValue } from 'ui-component/cards/AbonentCardView';

interface Props {
  open: boolean;
  onClose: () => void;
  accountNumber?: string;
}

interface ElectricMapping {
  _id: string;
  accountNumber: string;
  electricAccountNumber: string;
}

function BindingElectrAccountsModal({ open, onClose, accountNumber }: Props) {
  const { mode } = useCustomizationStore().customization;
  const [bindedElectrAccounts, setBoundElectrAccounts] = useState<ElectricMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [accountNumberEtk, setAccountNumberEtk] = useState('');
  const [coato, setCoato] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!accountNumber) return;
    setLoading(true);
    try {
      const { data } = await api.get('/abonents/electric-map', {
        params: { accountNumber }
      });
      setBoundElectrAccounts(data);
    } catch (error) {
      console.error('Failed to fetch electric accounts mapping', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && accountNumber) {
      fetchData();
      setAdding(false);
      setAccountNumberEtk('');
    }
  }, [open, accountNumber]);

  const handleDelete = async (electricAccountNumber: string) => {
    try {
      await api.patch('/abonents/remove-electr-from-map', { electricityAccountNumber: electricAccountNumber });
      // Refresh list
      await fetchData();
    } catch (error) {
      console.error('Failed to delete electric account mapping', error);
    }
  };

  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !accountNumberEtk.trim()) return;
    setSubmitting(true);
    try {
      await api.patch('/abonents/add-electr-to-map', {
        accountNumber,
        electricityAccountNumber: accountNumberEtk.trim()
      });
      setAccountNumberEtk('');
      setAdding(false);
      await fetchData();
    } catch (error) {
      console.error('Failed to add electric account mapping', error);
    } finally {
      setSubmitting(false);
    }
  };

  const [hetAbonent, setHetAbonent] = useState<HETSuccessResponse>();
  useEffect(() => {
    if (accountNumberEtk.length > 6 && coato.length == 5) {
      useAbonentStore
        .getState()
        .getHetAbonent({ coato, personalAccount: accountNumberEtk })
        .then((res) => {
          if ('code' in res) {
            toast.error(res.message);
          } else {
            setHetAbonent(res);
          }
        });
    } else {
      setHetAbonent(undefined);
    }
  }, [accountNumberEtk, coato]);

  return (
    <DraggableDialog title="Bog'langan elektr hisob raqamlari" onClose={onClose} open={open} maxWidth="xs" fullWidth>
      <DialogContent dividers sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : !accountNumber ? (
          <Box sx={{ py: 2 }}>
            <Typography sx={{ color: 'error.main', textAlign: 'center' }}>Abonent hisob raqami topilmadi.</Typography>
          </Box>
        ) : (
          <Box>
            {bindedElectrAccounts.length === 0 ? (
              <Box
                sx={{
                  py: 3,
                  textAlign: 'center',
                  bgcolor: mode === 'dark' ? 'dark.main' : 'grey.50',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: mode === 'dark' ? 'divider' : 'grey.300',
                  mb: 2
                }}
              >
                <Typography sx={{ color: 'text.secondary' }}>Bog'langan elektr hisob raqamlari mavjud emas.</Typography>
              </Box>
            ) : (
              <List sx={{ mb: 2, p: 0 }}>
                {bindedElectrAccounts.map((row) => (
                  <ListItem
                    key={row._id}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      mb: 1.5,
                      border: '1px solid',
                      borderColor: mode === 'dark' ? 'divider' : 'grey.200',
                      boxShadow: mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.02)',
                      '&:hover': {
                        borderColor: mode === 'dark' ? 'primary.200' : 'primary.light',
                        boxShadow: mode === 'dark' ? 'none' : '0 2px 6px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, color: 'warning.main' }}>
                      <ElectricBolt />
                    </Box>
                    <ListItemText
                      primary={<Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{row.electricAccountNumber}</Typography>}
                      secondary={`Abonent: ${row.accountNumber}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={t('buttons.delete') || "O'chirish"}>
                        <IconButton edge="end" onClick={() => handleDelete(row.electricAccountNumber)} color="error" size="small">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            {adding ? (
              <Box
                component="form"
                onSubmit={handleAddNewAccount}
                sx={{
                  p: 2,
                  bgcolor: mode === 'dark' ? 'dark.main' : 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: mode === 'dark' ? 'divider' : 'grey.200',
                  mb: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'primary.dark' }}>
                  Yangi elektr hisob raqamini biriktirish
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Stack direction={'row'}>
                    <TextField label={t('tableHeaders.electricityCoato')} value={coato} onChange={(e) => setCoato(e.target.value)} />
                    <TextField
                      label={t('tableHeaders.electricityAccountNumber')}
                      value={accountNumberEtk}
                      onChange={(e) => setAccountNumberEtk(e.target.value)}
                    />
                  </Stack>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting || !accountNumberEtk.trim()}
                    startIcon={<Add />}
                  >
                    {submitting ? <CircularProgress size={20} color="inherit" /> : t('buttons.add') || "Qo'shish"}
                  </Button>
                  <IconButton onClick={() => setAdding(false)} disabled={submitting} size="small">
                    <Close />
                  </IconButton>
                </Stack>
                <CompactKeyValue
                  data={[
                    { key: t('tableHeaders.fullName'), value: hetAbonent?.fullName },
                    { key: t('tableHeaders.phone'), value: hetAbonent?.phone },
                    { key: t('tableHeaders.cadastralNumber'), value: hetAbonent?.cadastralNumber },
                    { key: t('tableHeaders.address'), value: hetAbonent?.address }
                  ]}
                />
              </Box>
            ) : (
              <Button color="primary" variant="outlined" onClick={() => setAdding(true)} startIcon={<Add />} fullWidth sx={{ py: 1 }}>
                Yangi hisob raqam qo'shish
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} color="inherit">
          {t('buttons.close') || 'Yopish'}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default BindingElectrAccountsModal;
