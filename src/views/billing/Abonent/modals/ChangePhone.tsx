import { Button, DialogActions, OutlinedInput, TextField } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';

function ChangePhoneDialog({ open = true, handleClose }: { open?: boolean; handleClose: () => void }) {
  const { updatePhone, abonentDetails } = useAbonentStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homePhone, setHomePhone] = useState('');

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
    if (open) {
      setPhoneNumber(abonentDetails?.phone || '');
      inputRef.current?.focus();
    }
  }, [open]);

  return (
    <DraggableDialog title={t('buttons.editPhone')} open={open} onClose={handleClose} maxWidth="xs">
      <form onSubmit={(e) => handleSubmit(e)}>
        <TextField
          label={t('tableHeaders.phone')}
          value={phoneNumber}
          inputProps={{ maxLength: 9 }}
          onChange={(e) => {
            if (!isNaN(Number(e.target.value))) {
              setPhoneNumber(e.target.value);
            }
          }}
          error={phoneNumber.length !== 9 && phoneNumber.length > 0}
          inputRef={inputRef}
          onFocus={handleFocus}
        />
        {/* <TextField
          label={t('tableHeaders.homePhone')}
          value={homePhone}
          inputProps={{ maxLength: 9 }}
          onChange={(e) => {
            if (!isNaN(Number(e.target.value))) {
              setHomePhone(e.target.value);
            }
          }}
          error={homePhone.length !== 9 && homePhone.length > 0}
        /> */}
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
