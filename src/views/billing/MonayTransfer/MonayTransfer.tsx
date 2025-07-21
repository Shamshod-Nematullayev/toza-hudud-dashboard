import { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from '../DeleteDublicate/InputFileDrop';
import { Button, Dialog, DialogActions, DialogContent, Grid, IconButton } from '@mui/material';
import PdfViewer from '../AbonentPetition/PDFViewer';
import { DataGrid } from '@mui/x-data-grid';
import ToolsMonayTransfer from './ToolsMonayTransfer';
import FooterMonayTransfer from './FooterMonayTransfer';
import api from 'utils/api';
import { Delete } from '@mui/icons-material';
import { IAriza } from 'types/models';
import PrintSectionMonayTransferAriza from './PrintSectionMonayTransferAriza';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import { IAbonentData } from '../CreateAbonentPetition.jsx/useStore';
import { extractQRCodeFromPDF } from 'views/tools/extractQRCodeFromPDF';
import { toast } from 'react-toastify';
import { getArizaById } from 'services/getArizaById';

export interface IRow extends IAbonentData {
  amount: number;
  residentId: number;
}

function MonayTransfer() {
  const [pdfFile, setPdfFile] = useState<{ file: File; url: string }>({ file: null, url: '' });
  const [rows, setRows] = useState<IRow[]>([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [abonentData, setAbonentData] = useState<IAbonentData>(null);
  const [ariza, setAriza] = useState<IAriza | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const printComponentRef = useRef(null);

  const { t } = useTranslation();

  const openPrintSection = (data: IAriza) => {
    setAriza(data);
    setOpenDialog(true);
  };

  const printFunc = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: printComponentRef
  });

  const handleClickDeleteButton = (id) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const clearPdfFile = () => setPdfFile({ file: null, url: '' });

  useEffect(() => {
    if (accountNumber.length === 12) {
      api.get('/billing/get-abonent-data-by-licshet/' + accountNumber).then(({ data }) => {
        setAbonentData({ ...data.abonentData, kSaldo: data.abonentData.balance.kSaldo, residentId: data.abonentData.id });
      });
    } else {
      setAbonentData(null);
    }
  }, [accountNumber]);

  useEffect(() => {
    (async () => {
      if (pdfFile.file) {
        const qrData = await extractQRCodeFromPDF(new Uint8Array(await pdfFile.file.arrayBuffer()), 1);
        if (!qrData.ok) return;

        const [key, id, document_number] = qrData.result.split('_');
        if (key !== 'ariza') {
          return toast.error("Noma'lum QR kod");
        }
        const ariza = await getArizaById(id);
        if (ariza.document_number !== Number(document_number)) {
          return toast.error("QR koddagi va bazadagi ariza raqamlari o'zaro mos emas");
        }
        if (ariza.document_type !== 'pul_kuchirish')
          return toast.info("Bu turdagi arizalar: Import arizalar bo'limidan kiritiladi.", { autoClose: 10000 });
        setAriza(ariza);
        setAbonentData(); // shu joyiga keldim abonent ma'lumotini olishi kerak
      }
    })();
  }, [pdfFile]);
  return (
    <MainCard contentSX={{ height: 'calc( 100vh  - 130px )' }}>
      <Grid container spacing={1} height={'100%'}>
        <Grid item xs={6} height={'100%'}>
          <ToolsMonayTransfer
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            rows={rows}
            setRows={setRows}
            abonentData={abonentData}
            setAmount={setAmount}
            amount={amount}
            clearPdfFile={clearPdfFile}
            pdfFile={pdfFile.file}
            openPrintSection={openPrintSection}
          />
          <DataGrid
            columns={[
              { field: 'id', headerName: 'ID', width: 50 },
              { field: 'accountNumber', headerName: 'Hisob raqami', flex: 1 },
              { field: 'fullName', headerName: 'FIO', flex: 1 },
              { field: 'kSaldo', headerName: 'Saldo', flex: 1, type: 'number' },
              { field: 'amount', headerName: "Ko'chiriladigan summa", flex: 1, type: 'number' },
              {
                field: 'actions',
                headerName: 'Amallar',
                flex: 1,
                renderCell: (row) => (
                  <>
                    <IconButton color="error" onClick={() => handleClickDeleteButton(row.row.id)}>
                      <Delete />
                    </IconButton>
                  </>
                )
              }
            ]}
            rows={rows}
            slots={{
              footer: () => (
                <FooterMonayTransfer
                  debitorAmount={rows.length > 0 && rows[0].amount}
                  creditorAmount={rows.length > 0 && rows.slice(1).reduce((a, b) => a + b.amount, 0)}
                />
              )
            }}
            sx={{
              maxHeight: 'calc(100vh - 260px)'
            }}
          />
        </Grid>
        <Grid item xs={6} height={'100%'}>
          {!pdfFile.url ? <FileInputDrop setFunc={setPdfFile} /> : <PdfViewer base64String={pdfFile.url} />}
        </Grid>
      </Grid>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          {ariza?._id ? (
            <PrintSectionMonayTransferAriza ariza={ariza} printComponentRef={printComponentRef} abonentDetails={rows[0]} />
          ) : (
            ''
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDialog(false)}>
            {t('buttons.close')}
          </Button>
          <Button variant="contained" onClick={() => printFunc()}>
            {t('buttons.print')}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

export default MonayTransfer;
