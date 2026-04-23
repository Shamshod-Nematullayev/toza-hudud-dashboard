import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useAbonentLogic } from '../useAbonentLogic';
import { Button, DialogActions, Stack, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { CompactKeyValue } from 'ui-component/cards/AbonentCardView';
import { HETSuccessResponse } from '../types';

function EditElectricAccountModal() {
  const {
    openEditElectricAccountState,
    setOpenEditElectricAccountState,
    getHetAbonent,
    abonentDetails,
    updateElectricity,
    setHetAbonent: setGlobalHetAbonent,
    hetAbonent: globalHetAbonent
  } = useAbonentStore();
  const { residentId } = useAbonentLogic();

  const [accountNumber, setAccountNumber] = useState('');
  const [coato, setCoato] = useState('');
  const [hetAbonent, setHetAbonent] = useState<HETSuccessResponse>();

  useEffect(() => {
    if (abonentDetails?.id) {
      setAccountNumber(abonentDetails.electricityAccountNumber || '');
      setCoato(abonentDetails.electricityCoato || '');
    } else {
      setHetAbonent(undefined);
    }
  }, [residentId, abonentDetails]);
  useEffect(() => {
    if (accountNumber.length > 6 && coato.length == 5) {
      getHetAbonent({ coato, personalAccount: accountNumber }).then((res) => {
        if ('code' in res) {
          toast.error(res.message);
        } else {
          setHetAbonent(res);
        }
      });
    } else {
      setHetAbonent(undefined);
    }
  }, [accountNumber, coato]);

  const handleClose = () => setOpenEditElectricAccountState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateElectricity({ residentId, electricityAccountNumber: accountNumber, electricityCoato: coato });
    setGlobalHetAbonent(hetAbonent);
    handleClose();
  };
  return (
    <DraggableDialog open={openEditElectricAccountState} onClose={handleClose} title={t('buttons.edit')}>
      <form onSubmit={handleSubmit}>
        <Stack direction={'row'}>
          <TextField label={t('tableHeaders.electricityCoato')} value={coato} onChange={(e) => setCoato(e.target.value)} />
          <TextField
            label={t('tableHeaders.electricityAccountNumber')}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </Stack>

        <CompactKeyValue
          data={[
            { key: t('tableHeaders.fullName'), value: hetAbonent?.fullName },
            { key: t('tableHeaders.phone'), value: hetAbonent?.phone },
            { key: t('tableHeaders.cadastralNumber'), value: hetAbonent?.cadastralNumber },
            { key: t('tableHeaders.address'), value: hetAbonent?.address }
          ]}
        />
        <DialogActions>
          <Button type="submit" variant="contained">
            {t('buttons.saveChanges')}
          </Button>
        </DialogActions>
      </form>
    </DraggableDialog>
  );
}

export default EditElectricAccountModal;
