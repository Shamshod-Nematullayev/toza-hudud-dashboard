import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PdfViewer from '../AbonentPetition/PDFViewer';
import { useImportAktStore } from './useImportAktStore';
import FileInputDrop from 'ui-component/FileInputDrop';

function ImportAkt() {
  const { pdfFile, setPdfFile } = useImportAktStore();

  const [pdfFileUrl, setPdfFileUrl] = useState<Uint8Array | ''>('');
  useEffect(() => {
    async function fileToBase64() {
      if (pdfFile) {
        console.log(pdfFile);
        const arrayBuffer = await pdfFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        setPdfFileUrl(uint8Array);
      }
    }
    fileToBase64();
  }, [pdfFile]);
  return (
    <MainCard>
      <Grid container spacing={2}>
        {/* Creating form */}
        <Grid item xs={12} md={6}>
          Import form goes here
        </Grid>
        {/* PDF preview */}
        <Grid item xs={12} md={6}>
          {pdfFile === null ? <FileInputDrop setFiles={setPdfFile} clearTrigger={false} /> : <PdfViewer base64String={pdfFileUrl} />}
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default ImportAkt;
