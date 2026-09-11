import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogContentText, DialogActions, Button } from '@mui/material';
import api from 'utils/api';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

function RokirovkaModal({ handleClose, abonent, refresh }) {
  const { t } = useTranslation();
  const [freeAbonent, setFreeAbonent] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  useEffect(() => {
    api.get('/pendingNewAbonents/get-free-abonentid').then(({ data }) => {
      setFreeAbonent(data.data);
    });
  }, []);
  useEffect(() => {
    api
      .get('/pendingNewAbonents/generateAccountNumber', {
        params: {
          mahallaId: abonent.mahallaId,
          companyId: abonent.companyId
        }
      })
      .then(({ data }) => {
        setAccountNumber(data.accountNumber);
      });
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const handleConfirm = async function () {
    setSubmitting(true);
    try {
      const { data } = await api.post('/pendingNewAbonents/castling', {
        id: freeAbonent.id,
        newAbonentId: abonent._id,
        accountNumber: accountNumber
      });
      if (data.ok) {
        handleClose();
        toast.success(data.message || 'Muvaffaqiyatli almashtirildi');
        refresh();
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Xatolik yuz berdi';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={true}>
      <DialogTitle>{t('pendingAbonentsPage.Rokirovka')}</DialogTitle>
      <DialogContent>
        <DialogContentText>Rostdan ham ushbu abonentni {freeAbonent?.accountNumber} ga almashtirmoqchisiz?</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label={t('tableHeaders.fullName')}
          type="text"
          fullWidth
          variant="standard"
          InputProps={{ readOnly: true }}
          value={abonent.abonent_name}
        />
        <TextField
          autoFocus
          margin="dense"
          label={t('tableHeaders.mfy')}
          type="text"
          fullWidth
          variant="standard"
          InputProps={{ readOnly: true }}
          value={abonent.mahallaName}
        />
        <TextField
          autoFocus
          margin="dense"
          label={t('tableHeaders.accountNumber')}
          type="text"
          fullWidth
          variant="standard"
          InputProps={{ readOnly: true }}
          value={accountNumber}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>{t('buttons.close')}</Button>
        <Button onClick={handleConfirm} disabled={submitting || !accountNumber || !freeAbonent}>{t('buttons.confirm')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RokirovkaModal;
