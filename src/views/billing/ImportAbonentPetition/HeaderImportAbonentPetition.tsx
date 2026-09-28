import React from 'react';
import { Box, Button, Card, Chip, IconButton, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import {
  DeleteSweepOutlined,
  KeyboardOutlined,
  NoteAddOutlined as NoteAddOutlinedIcon,
  NoteAltOutlined,
  PictureAsPdfOutlined,
  UploadFileOutlined
} from '@mui/icons-material';
import useStore from './hooks/useStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TourHelpButton } from 'ui-component/tour';

interface HeaderProps {
  onStartTour?: () => void;
}

function HeaderImportAbonentPetition({ onStartTour }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      {/* 2-Bosqichli Yagona Navigatsiya */}
      <Box sx={{ width: '100%', mb: 0.5, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
        <Tabs value={1} textColor="primary" indicatorColor="primary" sx={{ minHeight: 36 }}>
          <Tab
            icon={<NoteAddOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={t('1. Ariza shakllantirish (Yaratish)')}
            onClick={() => navigate('/billing/createAbonentAriza')}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px', minHeight: 36, cursor: 'pointer' }}
          />
          <Tab
            icon={<UploadFileOutlined fontSize="small" />}
            iconPosition="start"
            label={t('2. Arizalarni kiritish (Tozamakon ijrosi)')}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '13px', minHeight: 36 }}
          />
        </Tabs>
      </Box>

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
