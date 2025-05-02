import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import { useUserStore } from 'store/userStore';
import api from 'utils/api';

function SettingsModal() {
  const { closeSettingsModal } = useUserStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setIsLoading } = useLoaderStore();

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeSettingsModal();
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Majburiy qiymatlar kiritilmadi');
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Yangi parol va takroran kiritilgan parol o'zaro mos kiritilmadi");
      }
      const result = (
        await api.put('/auth/change-password', {
          newPassword,
          login: JSON.parse(localStorage.getItem('user')).login,
          password: currentPassword
        })
      ).data;
      if (!result.ok) throw new Error(result.message);
      toast.success(result.message);
      closeSettingsModal();
    } catch (error) {
      console.log({ err: error.message });
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={true} aria-labelledby="dialog-title" onKeyDown={onKeyDown}>
      <form onSubmit={handleSubmit}>
        <DialogTitle id={'dialog-title'}>
          <Typography variant="h2">Sozlamalar</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div>Parolni almashtirish</div>
            <FormControl sx={{ gap: '5px' }}>
              <TextField
                placeholder="Hozirgi parol"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                color="secondary"
                required
              />
              <TextField
                placeholder="Yangi parol"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                color="secondary"
                required
              />
              <TextField
                placeholder="Parolni takrorlang"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                color="secondary"
                required
              />
            </FormControl>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSettingsModal} color={'secondary'}>
            Chiqish
          </Button>
          <Button type="submit" variant="contained" color="secondary">
            Saqlash
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SettingsModal;
