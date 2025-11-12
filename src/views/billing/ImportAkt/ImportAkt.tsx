import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PdfViewer from '../AbonentPetition/PDFViewer';
import { useImportAktStore } from './useImportAktStore';
import FileInputDrop from 'ui-component/FileInputDrop';
import { t } from 'i18next';

function ImportAkt() {
  const { pdfFile, setPdfFile, setExcelFile, getActPacks, actPacks } = useImportAktStore();

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
  useEffect(() => {
    getActPacks();
  }, []);
  return (
    <MainCard>
      <Grid container spacing={2}>
        {/* Creating form */}
        <Grid item xs={12} md={6}>
          <FormControl>
            <InputLabel id="select-label">{t('importAktsPage.actPack')}</InputLabel>
            <Select labelId="select-label" label={t('importAktsPage.actPack')}>
              {actPacks.map((a) => (
                <MenuItem>
                  {a.name}-{new Date(a.createdDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
            <TextField
              type="file"
              inputProps={{
                accept: '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              }}
              onChange={(e) => setExcelFile((e.target as HTMLInputElement).files![0])}
            />
          </FormControl>
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
