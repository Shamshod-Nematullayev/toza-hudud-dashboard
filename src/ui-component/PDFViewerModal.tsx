import { Dialog } from '@mui/material';
import PdfViewer from 'views/billing/AbonentPetition/PDFViewer';

function PDFViewerModal({ base64 }: { base64: string }) {
  return (
    <Dialog open={true}>
      <PdfViewer base64String={base64} />
    </Dialog>
  );
}

export default PDFViewerModal;
