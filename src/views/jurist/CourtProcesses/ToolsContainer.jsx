import { Button, Typography } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';

function ToolsContainer({ setShowCreateArizaModal, selectedRows }) {
  const handleCreateArizaButtonClick = () => {
    if (selectedRows.length === 0) return toast.error('Ariza yaratish uchun qatorni tanlang tanlang!');
    setShowCreateArizaModal(true);
  };
  return (
    <div className="tools-container" style={{ margin: '0 25px', width: '10%' }}>
      <Typography component={Button} variant="subtitle1" onClick={handleCreateArizaButtonClick} fullWidth>
        Ariza chiqorish
      </Typography>
      <Typography component={Button} variant="subtitle1" onClick={'todo'} fullWidth>
        Arizalarni tizimga kiritish
      </Typography>
    </div>
  );
}

export default ToolsContainer;
