import { Button, ButtonGroup, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PdfViewer from '../AbonentPetition/PDFViewer';
import { useImportAktStore } from './useImportAktStore';
import FileInputDrop from 'ui-component/FileInputDrop';
import { t } from 'i18next';
import { Clear, Download, QuestionMark, UploadFile } from '@mui/icons-material';
import useLoaderStore from 'store/loaderStore';
import ImportAktInfo from './ImportAktInfo';

const packTypes = ['SIMPLE', 'SERVICE_NOT_PROVIDED', 'CANCEL_CONTRACT', 'INVENTORY', 'SPECIAL', 'ECO_PAY_INVENTORY', 'FROZEN'];

function ImportAkt() {
  const {
    pdfFile,
    setPdfFile,
    excelFile,
    setExcelFile,
    getActPacks,
    actPacks,
    selectedActPackId,
    setSelectedActPackId,
    packType,
    setPackType,
    clearStore,
    downloadTemplate,
    sendImportAktRequest,
    uploadFileToBilling
  } = useImportAktStore();
  const { setIsLoading } = useLoaderStore();
  const fileInputRef = useRef(null);
  const [infoModal, setInfoModal] = useState(false);

  const [pdfFileUrl, setPdfFileUrl] = useState<Uint8Array | ''>('');
  useEffect(() => {
    async function fileToBase64() {
      try {
        setIsLoading(true);
        if (pdfFile) {
          await uploadFileToBilling();
          const arrayBuffer = await pdfFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          setPdfFileUrl(uint8Array);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
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
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="select-label">{t('importAktsPage.actPack')}</InputLabel>
            <Select
              labelId="select-label"
              label={t('importAktsPage.actPack')}
              value={selectedActPackId}
              onChange={(e) => setSelectedActPackId(Number(e.target.value))}
            >
              {actPacks.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}-{new Date(a.createdDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!selectedActPackId && (
            <FormControl fullWidth>
              <InputLabel id="select-label-2">{t('importAktsPage.actPackType')}</InputLabel>
              <Select
                labelId="select-label-2"
                label={t('importAktsPage.actPackType')}
                value={packType}
                onChange={(e) => setPackType(e.target.value)}
              >
                {packTypes.map((p) => (
                  <MenuItem key={p} value={p}>
                    {t(('ACT_PACK_TYPES.' + p) as any)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            inputRef={fileInputRef}
            type="file"
            inputProps={{
              accept: '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }}
            onChange={(e) => setExcelFile((e.target as HTMLInputElement).files![0])}
            fullWidth
            sx={{ my: 3 }}
          />
          <ButtonGroup fullWidth>
            <Button variant="contained" color="primary" startIcon={<UploadFile />} sx={{ mx: 1 }}>
              {t('buttons.submitEntry')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Clear />}
              onClick={() => {
                clearStore();
                (fileInputRef.current as any)!.value = '';
              }}
            >
              {t('buttons.clear')}
            </Button>

            <Tooltip title={t('importAktsPage.downloadTemplate')} arrow>
              <IconButton onClick={downloadTemplate}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('importAktsPage.info')} arrow>
              <IconButton onClick={() => setInfoModal(true)}>
                <QuestionMark />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Grid>
        {/* PDF preview */}
        <Grid item xs={12} md={6}>
          {pdfFile === null ? <FileInputDrop setFiles={setPdfFile} clearTrigger={false} /> : <PdfViewer base64String={pdfFileUrl} />}
        </Grid>
      </Grid>
      <ImportAktInfo handleClose={() => setInfoModal(false)} open={infoModal} />
    </MainCard>
  );
}

export default ImportAkt;
