import { Button, DialogActions, OutlinedInput, TextField } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';

function ChangePhoneDialog({ open = true, handleClose }: { open?: boolean; handleClose: () => void }) {
  const [value, setValue] = useState('');
  const { updatePhone } = useAbonentStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updatePhone(value);
    handleClose();
  };

  return (
    <DraggableDialog title={t('buttons.editPhone')} open={open} onClose={handleClose}>
      <form onSubmit={(e) => handleSubmit(e)}>
        <TextField
          label={t('tableHeaders.phone')}
          value={value}
          inputProps={{ maxLength: 9 }}
          onChange={(e) => {
            if (!isNaN(Number(e.target.value))) {
              setValue(e.target.value);
            }
          }}
          error={value.length !== 9 && value.length > 0}
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
