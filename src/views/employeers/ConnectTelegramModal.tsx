import { Label } from '@mui/icons-material';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';

function ConnectTelegramModal({ setOpenConnectTelegramModal, inspectors }: any) {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<any>({});
  const [selectedInspector, setSelectedInspector] = useState('0');

  const { t } = useTranslation();

  const handleClose = () => {
    setOpenConnectTelegramModal(false);
  };

  const handleCheck = async () => {
    try {
      if (!userId) {
        setUser({});
        return toast.info(t('inspectorsPage.enterTelegramId'));
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
        return toast.info(t('inspectorsPage.enterTelegramId'));
      }
      if (selectedInspector === '0') {
        return toast.info(t('inspectorsPage.chooseInspector'));
      }
      await api.post('/inspectors/set-inspector-telegram-id', {
        telegramId: userId,
        inspectorId: selectedInspector
      });
      toast.success(t('inspectorsPage.telegramConnected'));
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setUser({});
  }, [userId]);
  return (
    <DraggableDialog open={true} onClose={handleClose} title={t('inspectorsPage.toConnectTelegram')}>
      <DialogContent>
        <DialogContentText>
          <TextField
            variant="standard"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            fullWidth
            label={t('inspectorsPage.userTelegramId')}
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
            label={t('inspectorsPage.userName')}
            margin="dense"
            value={user ? `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}` : ''}
          />
          {user.first_name && (
            <>
              <Label id={'labelId'} sx={{ mt: 2 }} variant="standard" color="secondary" component={Select}>
                {t('inspectorsPage.chooseInspector')}
              </Label>
              <Select
                labelId="labelId"
                value={selectedInspector}
                onChange={(e) => setSelectedInspector(e.target.value)}
                variant="standard"
                fullWidth
              >
                <MenuItem value={0} disabled>
                  {t('inspectorsPage.chooseInspector')}
                </MenuItem>
                {inspectors.map((inspector: any) => (
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
        <Button onClick={handleCheck} variant="outlined" color="primary" disabled={!userId}>
          {t('tableActions.check')}
        </Button>
        <Button onClick={handleConnect} variant="contained" color="primary" disabled={!user.first_name || !selectedInspector}>
          {t('tableActions.confirm')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default ConnectTelegramModal;
