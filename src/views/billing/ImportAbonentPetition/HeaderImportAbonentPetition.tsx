import { CachedOutlined, KeyboardOutlined, UploadFileOutlined } from '@mui/icons-material';
import { Box, Button, Chip, TextField } from '@mui/material';
import React from 'react';
import useStore from './hooks/useStore';
import { t } from 'i18next';

function HeaderImportAbonentPetition() {
  const { enteringMode, setEnteringMode } = useStore();
  const handleClickManualButton = () => {
    switch (enteringMode) {
      case 'ariza':
        setEnteringMode('manual');
        break;
      case 'manual':
        setEnteringMode('ariza');
        break;
    }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<UploadFileOutlined />}
          disabled
          sx={{ ':disabled': { color: 'inherit' }, mr: 2, fontSize: 18 }}
        >
          Arizalar kiritish
        </Button>
        {enteringMode === 'ariza' ? (
          // PDF rejimi QR kod orqali olish
          <Chip label="Ariza rejimi" color="primary" />
        ) : (
          <Chip label="Qo'lda kiritish rejimi" color="secondary" />
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField label="Ariza №" variant="outlined" size="small" />
        <Button variant="outlined" startIcon={<CachedOutlined />} sx={{ width: 200, borderRadius: 3 }}>
          {t('buttons.refresh')}
        </Button>
        <Button variant="outlined" startIcon={<KeyboardOutlined />} sx={{ width: 200, borderRadius: 3 }} onClick={handleClickManualButton}>
          {t('buttons.manualEntry')}
        </Button>
      </Box>
    </div>
  );
}

export default HeaderImportAbonentPetition;
