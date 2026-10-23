import React, { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export interface ConfirmActionOptions {
  title: string;
  text: React.ReactNode;
  confirmLabel: string;
  color?: 'error' | 'warning' | 'success' | 'primary';
  onConfirm: () => Promise<void> | void;
}

interface Props {
  options: ConfirmActionOptions | null;
  onClose: () => void;
}

// Qaytarib bo'lmaydigan amallar oldidan so'raladigan oyna. Amal tugaguncha tugma yuklanish holatida turadi.
function ConfirmActionDialog({ options, onClose }: Props) {
  const [running, setRunning] = useState(false);

  const handleConfirm = async () => {
    if (!options) return;
    setRunning(true);
    try {
      await options.onConfirm();
    } finally {
      setRunning(false);
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(options)} onClose={() => !running && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{options?.title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">{options?.text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={running} color="inherit">
          Ortga
        </Button>
        <Button
          variant="contained"
          color={options?.color || 'primary'}
          onClick={handleConfirm}
          disabled={running}
          startIcon={running ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {options?.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmActionDialog;
