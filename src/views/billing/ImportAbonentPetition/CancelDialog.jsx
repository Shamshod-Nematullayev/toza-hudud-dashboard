import { Button, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, TextareaAutosize } from '@mui/material';
import React, { useState } from 'react';
import useStore from './useStore';

function CancelDialog() {
  const { openCancelPetitionDialogState, closeCancelPetitionDialog, rejectAbonentPetition } = useStore();
  const [cancelingDescription, setCancelingDescription] = useState('');

  return (
    <Dialog open={openCancelPetitionDialogState} onClick={closeCancelPetitionDialog}>
      <DialogContent>
        <DialogContentText>Ariza nima sababdan bekor qilinyapti?</DialogContentText>
        <FormControl fullWidth>
          <TextareaAutosize
            minRows={5}
            style={{ resize: 'none' }}
            value={cancelingDescription}
            onChange={(e) => setCancelingDescription(e.target.value)}
          ></TextareaAutosize>
        </FormControl>
        <DialogActions>
          <Button onClick={closeCancelPetitionDialog}>Chiqish</Button>
          <Button onClick={() => rejectAbonentPetition(cancelingDescription)}>Davom etish</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export default CancelDialog;
