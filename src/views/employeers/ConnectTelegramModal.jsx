import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'utils/api';

function ConnectTelegramModal({ setOpenConnectTelegramModal, inspectors }) {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState({});
  const [selectedInspector, setSelectedInspector] = useState(0);
  const handleClose = () => {
    setOpenConnectTelegramModal(false);
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };
  const handleCheck = async () => {
    try {
      if (!userId) {
        setUser({});
        return toast.info('Iltimos telegram id raqamini kiriting');
      }
      const result = (await api.get(`/inspectors/check-telegram/${userId}`)).data;
      setUser(result.user);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConnect = async () => {
    try {
      if (!userId) {
        setUser({});
        return toast.info('Iltimos telegram id raqamini kiriting');
      }
      if (selectedInspector === 0) {
        return toast.info('Iltimos nazoratchini tanlang');
      }
      await api.post('/inspectors/set-inspector-telegram-id', {
        telegramId: userId,
        inspectorId: selectedInspector
      });
      toast.success('Telegramga ulash muvaffaqiyatli amalga oshirildi');
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setUser({});
  }, [userId]);
  return (
    <Dialog open={1} onKeyDown={handleKeyDown}>
      <DialogTitle>Telegramga ulanish</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <TextField
            variant="standard"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            fullWidth
            label={'Foydalanuvchi telegram id raqami'}
            margin="dense"
          />
          <TextField
            variant="standard"
            InputProps={{
              readOnly: true
            }}
            InputLabelProps={{
              shrink: user.first_name
            }}
            fullWidth
            label={'Foydalanuvchi nomi'}
            margin="dense"
            value={user ? `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}` : ''}
          />
          {user.first_name && (
            <>
              Biriktiriladigan nazoratchi
              <Select value={selectedInspector} onChange={(e) => setSelectedInspector(e.target.value)} variant="standard" fullWidth>
                <MenuItem value={0} disabled>
                  Nazoratchini tanlang
                </MenuItem>
                {inspectors.map((inspector) => (
                  <MenuItem key={inspector.id} value={inspector.id}>
                    {inspector.name}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Yopish
        </Button>
        <Button onClick={handleCheck} variant="outlined" color="primary">
          Tekshirish
        </Button>
        <Button onClick={handleConnect} variant="contained" color="primary">
          Biriktirish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConnectTelegramModal;
