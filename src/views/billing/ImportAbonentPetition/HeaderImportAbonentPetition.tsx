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
        <Chip
          label={enteringMode === 'ariza' ? "Ariza rejimi" : "Qo'lda kiritish rejimi"}
          color={enteringMode === 'ariza' ? 'primary' : 'secondary'}
          onClick={handleClickManualButton}
          clickable
          sx={{ cursor: 'pointer' }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant={enteringMode === 'manual' ? 'contained' : 'outlined'}
          color="secondary"
          startIcon={<KeyboardOutlined />}
          onClick={handleClickManualButton}
          sx={{ borderRadius: 3 }}
        >
          {enteringMode === 'manual' ? "Ariza rejimiga o‘tish" : t('buttons.manualEntry')}
        </Button>
      </Box>
    </div>
  );
}

export default HeaderImportAbonentPetition;
