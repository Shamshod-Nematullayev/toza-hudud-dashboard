import React, { useEffect } from 'react';
import FileInputDrop from 'ui-component/FileInputDrop';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';
const extractQRCodeFromPDF = async (pdfData) => {
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const page = await pdfDoc.getPage(totalPages); // oxirgi sahifa

  const viewport = page.getViewport({ scale: 1 });
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

function SidePanel() {
  const { setPdfFiles, pdfFiles, clearPdfFiles } = odamSoniXatlovStore();
  useEffect(() => {
    if (pdfFiles.length > 0) {
      async function getDataFromQR() {
        const arrayBuffer = await pdfFiles[0].file.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const data = await extractQRCodeFromPDF(pdfData);
        console.log('FIRE');
        console.log(data);
      }
      getDataFromQR();
    }
    console.log(pdfFiles);
  }, [pdfFiles]);
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
      {pdfFiles.length === 0 ? (
        <FileInputDrop setPdfFiles={setPdfFiles} />
      ) : (
        <>
          <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{position: "relatives"}}>
              <TextField sx={{ margin: 1 }} />

            </div>
            <Button variant="outlined" sx={{ margin: 1 }}>
              Hammasini kiritish
            </Button>
            <Button variant="outlined" sx={{ margin: 1 }} color="error">
              Hammasini bekor qilish
            </Button>
            <Button variant="outlined" color="secondary" sx={{ margin: 1 }} onClick={() => clearPdfFiles()}>
              Tugatish
            </Button>
          </div>
          <div>
            <DataGrid
              disableColumnFilter
              disableColumnSorting
              disableColumnMenu
              columns={[
                { field: 'order_num', headerName: '№' },
                { field: 'accountNumber', headerName: 'Hisob raqam' },
                { field: 'fullName', headerName: 'F.I.O.' },
                { field: 'YASHOVCHILAR', headerName: 'YASHOVCHILAR' },
                { field: 'holat_icon', headerName: 'status' }
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default SidePanel;
