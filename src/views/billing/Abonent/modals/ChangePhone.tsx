import { Button, DialogActions, OutlinedInput, TextField } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import PhoneInput from 'ui-component/PhoneInput';
import { onChange } from 'react-toastify/dist/core/store';

function ChangePhoneDialog() {
  const { updatePhone, abonentDetails, openChangePhoneDialogState, setOpenChangePhoneDialog } = useAbonentStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homePhone, setHomePhone] = useState('');

  const handleClose = () => {
    setOpenChangePhoneDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updatePhone(phoneNumber);
    handleClose();
  };

  const inputRef = useRef<any>(null);
  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(0, inputRef.current.value.length);
    }
  };
  useEffect(() => {
    if (openChangePhoneDialogState) {
      setPhoneNumber(abonentDetails?.phone || '');
      inputRef.current?.focus();
    }
  }, [openChangePhoneDialogState]);

  return (
    <DraggableDialog title={t('buttons.editPhone')} open={openChangePhoneDialogState} onClose={handleClose} maxWidth="xs">
      <form onSubmit={(e) => handleSubmit(e)}>
        <PhoneInput
          label={t('tableHeaders.phone')}
          value={phoneNumber}
          textFieldProps={{ inputRef, onFocus: handleFocus, error: phoneNumber.length !== 9 && phoneNumber.length > 0 }}
          onChange={(e) => setPhoneNumber(e)}
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

export default ChangePhoneDialog;
