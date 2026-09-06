import React from 'react';
import { Box, Button, Card, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  DeleteSweepOutlined,
  KeyboardOutlined,
  NoteAltOutlined,
  PictureAsPdfOutlined,
  UploadFileOutlined
} from '@mui/icons-material';
import useStore from './hooks/useStore';
import { useTranslation } from 'react-i18next';
import { TourHelpButton } from 'ui-component/tour';

interface HeaderProps {
  onStartTour?: () => void;
}

function HeaderImportAbonentPetition({ onStartTour }: HeaderProps) {
  const { t } = useTranslation();
  const { enteringMode, setEnteringMode, pdfFiles, setPdfFiles } = useStore();

  const handleToggleMode = () => {
    setEnteringMode(enteringMode === 'ariza' ? 'manual' : 'ariza');
  };

  const handleClearAllFiles = () => {
    setPdfFiles([]);
  };

  return (
    <Card
      id="tour-import-header"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5
      }}
    >
      {/* Chap tomon: Sarlavha, Rejim chipi va fayllar hisoblagichi */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <UploadFileOutlined color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('menuItems.importAbonentPetition', 'Arizalarni kiritish (Tozamakon)')}
          </Typography>
        </Stack>

        <Box id="tour-import-mode-switch">
          <Chip
            icon={enteringMode === 'ariza' ? <PictureAsPdfOutlined fontSize="small" /> : <KeyboardOutlined fontSize="small" />}
            label={
              enteringMode === 'ariza'
                ? t('importPage.arizaMode', 'Ariza rejimi (Avto OCR)')
                : t('importPage.manualMode', 'Qo‘lda kiritish rejimi')
            }
            color={enteringMode === 'ariza' ? 'primary' : 'secondary'}
            onClick={handleToggleMode}
            clickable
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
        </Box>

        {pdfFiles.length > 0 && (
          <Chip
            label={`${pdfFiles.length} ta PDF fayl`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>

      {/* O'ng tomon: Rejim almashtirish tugmasi, Tozalash va Tour Help */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          variant={enteringMode === 'manual' ? 'contained' : 'outlined'}
          color="secondary"
          size="small"
          startIcon={enteringMode === 'manual' ? <NoteAltOutlined /> : <KeyboardOutlined />}
          onClick={handleToggleMode}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {enteringMode === 'manual'
            ? t('importPage.backToArizaMode', 'Ariza rejimiga qaytish')
            : t('buttons.manualEntry', 'Qo‘lda kiritish')}
        </Button>

        {pdfFiles.length > 0 && (
          <Tooltip title={t('importPage.clearAllFiles', 'Barcha fayllarni tozalash')}>
            <IconButton size="small" color="error" onClick={handleClearAllFiles}>
              <DeleteSweepOutlined />
            </IconButton>
          </Tooltip>
        )}

        {onStartTour && <TourHelpButton onClick={onStartTour} />}
      </Stack>
    </Card>
  );
}

export default HeaderImportAbonentPetition;
