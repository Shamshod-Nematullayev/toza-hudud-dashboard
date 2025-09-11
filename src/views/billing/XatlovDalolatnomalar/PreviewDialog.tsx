import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
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
  setOpen: (boolean) => void;
}) {
  const [mahalla, setMahalla] = useState<IMahalla>({} as IMahalla);
  useEffect(() => {
    async function fetchData() {
      const mahalla = await getMahallaById(document.mahallaId.toString());
      setMahalla(mahalla.data);
    }
    fetchData();
  }, []);

  const handleExit = () => {
    setOpen(false);
  };
  return (
    <Dialog open={true} onClose={handleExit}>
      <DialogContent>
        <h3>{`${document.date.toLocaleDateString()} ${mahalla.name} Xujjat raqami: ${document.documentNumber}`}</h3>
        <table>
          <thead>
            <tr>
              <th>t/r</th>
              <th>FIO</th>
              <th>Hisob raqam</th>
              <th>Yashovchilar soni</th>
              <th>Holati</th>
            </tr>
          </thead>
          <tbody>
            {requestDocuments.map((requestDocument, i) => (
              <tr key={i}>
                <td>{i + 1}.</td>
                <td>{requestDocument.fio}</td>
                <td>{requestDocument.KOD}</td>
                <td style={{ textAlign: 'center' }}>{requestDocument.YASHOVCHILAR}</td>
                <td>{requestDocument.document_id ? 'yangi' : requestDocument.actId ? 'akt qilingan' : 'xujjat yaratilgan'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={handleExit}>
          Chiqish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PreviewDialog;
