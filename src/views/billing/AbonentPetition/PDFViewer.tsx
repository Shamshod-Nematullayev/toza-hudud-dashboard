import React from 'react';
import { Box, Typography } from '@mui/material';
import { RotateDirection, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { useTranslation } from 'react-i18next';

const PdfViewer = ({ base64String }: { base64String: string | null }) => {
  const { t } = useTranslation();

  const renderToolbar = (Toolbar: (props: ToolbarProps) => React.ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        const {
          CurrentPageInput,
          GoToNextPage,
          GoToPreviousPage,
          ZoomOut,
          Zoom,
          ZoomIn,
          EnterFullScreen,
          Rotate
        } = slots;

        return (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              width: '100%',
              p: 0.5,
              backgroundColor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
              gap: 0.5
            }}
          >
            {/* Zoom guruhi */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ZoomOut />
              <Zoom />
              <ZoomIn />
            </Box>

            <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', height: 20, mx: 1 }} />

            {/* Sahifa navigatsiyasi */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GoToPreviousPage />
              <Box sx={{ width: 45, mx: 0.5 }}>
                <CurrentPageInput />
              </Box>
              <GoToNextPage />
            </Box>

            <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', height: 20, mx: 1 }} />

            {/* Qo'shimcha amallar: Rotate va FullScreen */}
            <Box sx={{ display: 'flex', ml: 'auto', alignItems: 'center' }}>
              <Rotate direction={RotateDirection.Backward} />
              <Rotate direction={RotateDirection.Forward} />
              <EnterFullScreen />
            </Box>
          </Box>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs() {
      return [];
    },
    renderToolbar
  });

  if (!base64String) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
          color: 'text.secondary',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <PictureAsPdfOutlinedIcon sx={{ fontSize: 56, mb: 1, opacity: 0.5 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          {t('recalculationDetailPage.noPdfTitle', 'Hujjat fayli biriktirilmagan')}
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          {t('recalculationDetailPage.noPdfDesc', 'Ushbu arizaga biriktirilgan PDF fayl topilmadi')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Viewer fileUrl={base64String} plugins={[defaultLayoutPluginInstance]} />
    </Box>
  );
};

export default PdfViewer;
