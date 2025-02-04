import { PrintOutlined as Print } from '@mui/icons-material';
import { Button, Grid, Typography, useMediaQuery } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import useStore from './useStore';

function ToolsContainer({ setShowCreateArizaModal, selectedRows }) {
  const isXs = useMediaQuery('(max-width:600px)');
  const handleCreateArizaButtonClick = () => {
    if (selectedRows.length === 0) return toast.error('Ariza yaratish uchun qatorni tanlang tanlang!');
    setShowCreateArizaModal(true);
  };
  return (
    <Grid container>
      <Grid item>
        <Button variant="outlined" onClick={handleCreateArizaButtonClick} disabled={!selectedRows.length}>
          <Print /> {isXs ? '' : 'Ariza chiqorish'}
        </Button>
      </Grid>
    </Grid>
  );
}

export default ToolsContainer;
