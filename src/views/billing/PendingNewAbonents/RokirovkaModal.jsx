import React from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogContentText, DialogActions, Button } from '@mui/material';

function RokirovkaModal() {
  return (
    <Dialog open={1}>
      <DialogTitle>Rokirovka</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to proceed with the operation?</DialogContentText>
        <TextField autoFocus margin="dense" id="name" label="Name" type="text" fullWidth variant="standard" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>OK</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RokirovkaModal;
