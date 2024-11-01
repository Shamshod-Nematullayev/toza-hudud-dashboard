import { Button, Card, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ToolsContainer({ setShowCreateArizaModal, selectedRows }) {
  const handleCreateArizaButtonClick = () => {
    if (selectedRows.length === 0) return toast.error('Ariza yaratish uchun qatorni tanlang tanlang!');
    setShowCreateArizaModal(true);
  };
  return (
    <Card className="tools-container" style={{ margin: '0 25px 0 0', width: '10%' }}>
      <ul style={{ listStyle: 'none' }}>
        <li>
          <Typography component={Button} variant="subtitle1" onClick={handleCreateArizaButtonClick}>
            Ariza chiqorish
          </Typography>
        </li>
        <li>
          <Typography component={Link} variant="subtitle1" to="/jurist/courtProccesses/import-petition">
            Arizalarni tizimga kiritish
          </Typography>
        </li>
      </ul>
    </Card>
  );
}

export default ToolsContainer;
