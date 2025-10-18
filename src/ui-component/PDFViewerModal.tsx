import { Close } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, IconButton } from '@mui/material';
import PdfViewer from 'views/billing/AbonentPetition/PDFViewer';

function PDFViewerModal({ base64, handleClose }: { base64: string; handleClose: () => void }) {
  return (
    <Dialog open={true} maxWidth="xl" onClose={handleClose}>
      <DialogActions>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogActions>
      <DialogContent sx={{ width: '40vw', height: '900px', p: 0 }}>
        <PdfViewer base64String={base64} />
      </DialogContent>
    </Dialog>
  );
}

export default PDFViewerModal;
