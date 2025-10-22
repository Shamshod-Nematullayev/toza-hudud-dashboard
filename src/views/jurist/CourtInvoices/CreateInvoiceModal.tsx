import { Button, Dialog, DialogActions, DialogContent, FormControl, TextField } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { createCourtInvoices } from 'services/createCourtInvoices';
import useLoaderStore from 'store/loaderStore';

function CreateInvoiceModal({ handleClose, reload }: { handleClose: () => void; reload: () => void }) {
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceCount, setCountInvoice] = useState('');
  const { setIsLoading } = useLoaderStore();
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await createCourtInvoices({ invoiceAmount: Number(invoiceAmount), invoiceCount: Number(invoiceCount) });
      reload();
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Dialog open onClose={handleClose}>
        <DialogContent>
          <FormControl sx={{ gap: '10px' }}>
            <TextField
              label={t('tableHeaders.cashAmount')}
              name="invoiceAmount"
              type="number"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
            />
            <TextField
              label={t('tableHeaders.cashCount')}
              name="countInvoice"
              type="number"
              value={invoiceCount}
              onChange={(e) => setCountInvoice(e.target.value)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={(e) => handleSubmit()}>
            {t('buttons.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}

export default CreateInvoiceModal;
