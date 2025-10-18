import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
const PdfViewer = ({ base64String }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {base64String && <Viewer fileUrl={base64String} plugins={[defaultLayoutPluginInstance]} />}
    </div>
  );
};

export default PdfViewer;
