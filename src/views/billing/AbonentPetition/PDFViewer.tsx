import { Delete } from '@mui/icons-material';
import { Box } from '@mui/material';
import { RotateDirection, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout';

const PdfViewer = ({ base64String }: { base64String: string }) => {
  const themeMode = 'dark'; // dark | light
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
          RotateBackwardMenuItem,
          RotateForwardMenuItem,
          Rotate
        } = slots;

        return (
          <Box
            style={{
              alignItems: 'center',
              display: 'flex',
              width: '100%',
              padding: '4px',
              background: 'paper.dark'
            }}
          >
            {/* Zoom guruhi */}
            <div style={{ display: 'flex', padding: '0 4px' }}>
              <ZoomOut />
              <Zoom />
              <ZoomIn />
            </div>

            <div style={{ borderLeft: '1px solid #ccc', height: '24px', margin: '0 8px' }} />

            {/* Sahifa navigatsiyasi */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <GoToPreviousPage />
              <div style={{ width: '45px' }}>
                <CurrentPageInput />
              </div>
              <GoToNextPage />
            </div>

            <div style={{ borderLeft: '1px solid #ccc', height: '24px', margin: '0 8px' }} />

            {/* Qo'shimcha amallar: Rotate va FullScreen */}
            <div style={{ display: 'flex', marginLeft: 'auto' }}>
              {/* <RotateBackwardMenuItem />
              <RotateForwardMenuItem /> */}
              <Rotate direction={RotateDirection.Backward} />
              <Rotate direction={RotateDirection.Forward} />
              <EnterFullScreen />
            </div>
          </Box>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs(defaultTabs) {
      return [];
    },
    renderToolbar
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {base64String && <Viewer fileUrl={base64String} plugins={[defaultLayoutPluginInstance]} />}
    </div>
  );
};

export default PdfViewer;
