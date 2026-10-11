import { Button, Dialog, DialogActions, DialogContent, useMediaQuery, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { getMahallaById } from 'services/getMahallaById';
import { IMahalla, IMultiplyRequest, IXatlovDocument } from 'types/billing';

function PreviewDialog({
  requestDocuments,
  document,
  setOpen
}: {
  requestDocuments: IMultiplyRequest[];
  document: IXatlovDocument;
  setOpen: (open: boolean) => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mahalla, setMahalla] = useState<IMahalla>({} as IMahalla);

  useEffect(() => {
    async function fetchData() {
      const res = await getMahallaById(document.mahallaId.toString());
      setMahalla(res.data);
    }
    fetchData();
  }, [document.mahallaId]);

  const handleExit = () => {
    setOpen(false);
  };

  return (
    <Dialog open={true} onClose={handleExit} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {`${document.date ? new Date(document.date).toLocaleDateString() : ''} ${mahalla.name || ''} Xujjat raqami: ${document.documentNumber}`}
        </Typography>
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.palette.divider}`, textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>t/r</th>
                <th style={{ padding: '8px' }}>FIO</th>
                <th style={{ padding: '8px' }}>Hisob raqam</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Yashovchilar soni</th>
                <th style={{ padding: '8px' }}>Holati</th>
              </tr>
            </thead>
            <tbody>
              {requestDocuments.map((requestDocument, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <td style={{ padding: '8px' }}>{i + 1}.</td>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{requestDocument.fio}</td>
                  <td style={{ padding: '8px' }}><code>{requestDocument.KOD}</code></td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{requestDocument.YASHOVCHILAR}</td>
                  <td style={{ padding: '8px' }}>{requestDocument.document_id ? 'yangi' : requestDocument.actId ? 'akt qilingan' : 'xujjat yaratilgan'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="primary" onClick={handleExit} fullWidth={isMobile}>
          Chiqish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PreviewDialog;
