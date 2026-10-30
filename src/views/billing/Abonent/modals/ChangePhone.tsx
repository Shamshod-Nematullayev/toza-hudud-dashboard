import { Box, Button, DialogActions } from '@mui/material';
import { DeleteOutlined } from '@mui/icons-material';
import { t } from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import PhoneInput from 'ui-component/PhoneInput';
import { toast } from 'react-toastify';

function ChangePhoneDialog() {
  const { updatePhone, abonentDetails, openChangePhoneDialogState, setOpenChangePhoneDialog } = useAbonentStore();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleClose = () => {
    setOpenChangePhoneDialog(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = phoneNumber.trim();
    if (trimmed && trimmed.length !== 9) return toast.warning("Telefon raqami 9 ta raqamdan iborat bo'lishi kerak");
    handleClose();
    if (trimmed !== (abonentDetails?.phone || '')) void updatePhone(trimmed);
  };

  const handleDeletePhone = () => {
    handleClose();
    void updatePhone('');
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

  const hasExistingPhone = Boolean(abonentDetails?.phone);

  return (
    <DraggableDialog title={t('buttons.editPhone')} open={openChangePhoneDialogState} onClose={handleClose} maxWidth="xs">
      <form onSubmit={(e) => handleSubmit(e)}>
        <PhoneInput
          label={t('tableHeaders.phone')}
          value={phoneNumber}
          textFieldProps={{ inputRef, onFocus: handleFocus, error: phoneNumber.length !== 9 && phoneNumber.length > 0 }}
          onChange={(e) => setPhoneNumber(e)}
        />
        <DialogActions sx={{ justifyContent: 'space-between', px: 0, pt: 2 }}>
          {hasExistingPhone ? (
            <Button
              type="button"
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlined />}
              onClick={handleDeletePhone}
            >
              {t('buttons.deletePhone') || "Raqamni o'chirish"}
            </Button>
          ) : (
            <Box />
          )}
          <Button type="submit" variant="contained">
            {t('buttons.saveChanges')}
          </Button>
        </DialogActions>
      </form>
    </DraggableDialog>
  );
}

export default ChangePhoneDialog;
