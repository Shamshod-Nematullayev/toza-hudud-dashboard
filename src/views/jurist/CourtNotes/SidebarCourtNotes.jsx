import { Button, Card, Grid, List, ListItem, TextField } from '@mui/material';
import React, { useState } from 'react';
import FileInputDrop from 'ui-component/FileInputDrop';
import useStore from './useStore';
import api from '../../../utils/api';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';
import useLoaderStore from 'store/loaderStore';
import { toast } from 'react-toastify';

function SidebarCourtNotes() {
  const [file, setFile] = useState(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const { Document, setDocument, mahallas } = useStore();
  const { setIsLoading } = useLoaderStore();
  const [qrDataOK, setQrDataOK] = useState(true);
  const extractQRCodeFromPDF = async (pdfData) => {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1); // 1-sahifani olish

    const viewport = page.getViewport({ scale: 1 }); // Sahifani ko'rsatish uchun viewportni olish
    const canvas = document.createElement('canvas'); // Yangi canvas yaratish
    const context = canvas.getContext('2d');

    // Canvasni sahifa hajmiga moslashtirish
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Sahifani canvasga render qilish
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Canvasdan tasvirni olish
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // QR kodni o'qish
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

    if (qrCode) {
      return { ok: true, result: qrCode.data };
    } else {
      return { ok: false, message: 'QR Code topilmadi.' };
    }
  };
  const setFunc = async (files) => {
    setIsLoading(true);
    setFile(files[0]);
    const pdfData = new Uint8Array(await files[0].arrayBuffer());
    const data = await extractQRCodeFromPDF(pdfData);
    setQrDataOK(data.ok);
    if (!data.ok) return setIsLoading(false);
    api
      .get('/targets/document/' + data.result?.split('_')[1])
      .then(({ data }) => {
        setDocument(data.document);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleSubmitDocumentNumber = (e) => {
    e.preventDefault();
    setIsLoading(true);
    api.get('/targets/document', { params: { doc_num: documentNumber } }).then(({ data }) => {
      setDocument(data.data[0]);
      setIsLoading(false);
    });
  };
  const handleClear = () => {
    setDocument({});
    setDocumentNumber('');
    setFile(null);
    handleClearFiles();
  };
  const handlePrimaryButtonClick = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    api
      .patch('/targets/signDocument/' + Document._id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(({ data }) => {
        toast.success(data.message);
        handleClear();
        setIsLoading(false);
      });
  };
  const [clear, setClear] = useState(false);
  const handleClearFiles = () => {
    setClear(true);
    setTimeout(() => setClear(false), 100); // Triggerni yana ishlashga tayyor qilish
  };
  return (
    <Grid container spacing="20">
      <Grid item xs={12}>
        <FileInputDrop clearTrigger={clear} setFiles={setFunc} />
      </Grid>
      <Grid item xs={12}>
        <List sx={{ fontSize: '16px' }}>
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Xujjat raqami:</span> <span>{Document.doc_num}</span>
          </ListItem>
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Nazoratchi:</span> <span>{Document.inspector?.name}</span>
          </ListItem>
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mahalla:</span> <span>{mahallas.find((mfy) => mfy.id == Document.mahallaId)?.name}</span>
          </ListItem>
        </List>
      </Grid>
      {console.log(file, Boolean(file))}
      {!qrDataOK && !Document._id ? (
        <Grid item xs="12">
          <Card sx={{ boxShadow: 3, padding: '5px' }}>
            ❗️❗️❗️PDF fayldan QR kod topilmadi yoki yaroqsiz QR aniqlandi. Bildirishnomani aniqlash uchun uning ro'yxatdan o'tgan raqamini
            kiriting. <br />
            <form onSubmit={handleSubmitDocumentNumber}>
              <TextField
                type="number"
                placeholder="Bildirishnoma raqami"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </form>
          </Card>
        </Grid>
      ) : (
        ''
      )}
      <Grid item xs="6">
        <Button variant="outlined" color="secondary" fullWidth onClick={handleClear}>
          Tozalash
        </Button>
      </Grid>
      <Grid item xs="6">
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          disabled={!Document._id || Document.file_id}
          onClick={handlePrimaryButtonClick}
        >
          Kiritish
        </Button>
      </Grid>
    </Grid>
  );
}

export default SidebarCourtNotes;
