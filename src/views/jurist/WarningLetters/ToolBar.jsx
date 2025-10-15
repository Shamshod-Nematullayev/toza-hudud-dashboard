import { SendAndArchive, UploadFile } from '@mui/icons-material';
import { Button } from '@mui/material';
import React from 'react';
import useWarningLettersStore from './useStore';

function ToolBar() {
  const { checked } = useWarningLettersStore();
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      <Button variant="contained" color="secondary" startIcon={<SendAndArchive />} disabled={checked.length === 0}>
        Hybrid bazasidan yangilash
      </Button>
      <Button variant="contained" color="success" startIcon={<UploadFile />} disabled={checked.length === 0}>
        TozaMakonga yuklash
      </Button>
    </div>
  );
}

export default ToolBar;
