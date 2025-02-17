import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
const PdfViewer = ({ base64String }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return <>{base64String && <Viewer fileUrl={base64String} plugins={[defaultLayoutPluginInstance]} />}</>;
};

export default PdfViewer;
