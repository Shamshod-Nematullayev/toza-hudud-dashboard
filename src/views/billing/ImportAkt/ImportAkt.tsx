import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PdfViewer from '../AbonentPetition/PDFViewer';
import { useImportAktStore } from './useImportAktStore';
import FileInputDrop from 'ui-component/FileInputDrop';
import { t } from 'i18next';
import { Clear, Download, InsertDriveFile, QuestionMark, UploadFile, CheckCircleOutlined } from '@mui/icons-material';
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
    uploadFileToBilling,
    fileIdOnBilling,
    isImporting,
    isUploadingPdf,
    isDownloadingTemplate,
    isFetchingPacks
  } = useImportAktStore();

  const { setIsLoading } = useLoaderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [infoModal, setInfoModal] = useState(false);

  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');

  useEffect(() => {
    let url = '';
    async function uploadAndSetUrl() {
      try {
        if (pdfFile) {
          url = URL.createObjectURL(pdfFile);
          setPdfFileUrl(url);
          await uploadFileToBilling();
        } else {
          setPdfFileUrl('');
        }
      } catch (error) {
        console.error(error);
      }
    }
    uploadAndSetUrl();
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [pdfFile]);

  useEffect(() => {
    getActPacks();
  }, []);

  const handleClearAll = () => {
    clearStore();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendImport = async () => {
    const success = await sendImportAktRequest();
    if (success && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <MainCard
      contentSX={{
        height: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Grid container spacing={2} sx={{ flex: 1, height: '100%' }}>
        {/* Creating form */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ height: '100%', overflowY: 'auto' }}>
          <Stack spacing={2.5} sx={{ p: 1 }}>
            {/* Act Pack Selector */}
            <FormControl fullWidth disabled={isImporting}>
              <InputLabel id="select-label">{t('importAktsPage.actPack')}</InputLabel>
              <Select
                labelId="select-label"
                label={t('importAktsPage.actPack')}
                value={selectedActPackId}
                onChange={(e) => setSelectedActPackId(Number(e.target.value))}
              >
                <MenuItem value="">
                  <em>Yangi pachka yaratish (Pachka turini tanlang)</em>
                </MenuItem>
                {actPacks?.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} - {new Date(a.createdDate).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Act Pack Type (if no pack selected) */}
            {!selectedActPackId && (
              <FormControl fullWidth disabled={isImporting}>
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

            {/* Excel File Input Section */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Aktlar kiritilgan Excel fayli (.xlsx, .xls):
              </Typography>
              {excelFile ? (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', bgcolor: 'background.paper', p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <InsertDriveFile color="success" fontSize="large" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {excelFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(excelFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isImporting}
                    onClick={() => {
                      setExcelFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  disabled={isImporting}
                  startIcon={<UploadFile />}
                  sx={{ py: 1.5, borderStyle: 'dashed' }}
                >
                  Excel faylini tanlash...
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setExcelFile(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
              )}
            </Paper>

            {/* Status alerts */}
            {isImporting && (
              <Alert severity="info" icon={<CircularProgress size={18} color="inherit" />}>
                Aktlar import qilinmoqda, iltimos kuting...
              </Alert>
            )}

            {/* Buttons Row */}
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                startIcon={isImporting ? <CircularProgress size={18} color="inherit" /> : <UploadFile />}
                disabled={isImporting || isUploadingPdf || !pdfFile || !excelFile}
                onClick={handleSendImport}
                sx={{ py: 1.3, fontWeight: 700, fontSize: '0.95rem' }}
                fullWidth
              >
                {isImporting ? 'Import qilinmoqda...' : t('buttons.submitEntry')}
              </Button>

              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Clear />}
                  onClick={handleClearAll}
                  disabled={isImporting}
                  sx={{ flex: 1 }}
                >
                  {t('buttons.clear')}
                </Button>

                <Tooltip title={t('importAktsPage.downloadTemplate')} arrow>
                  <span>
                    <IconButton
                      color="primary"
                      onClick={downloadTemplate}
                      disabled={isDownloadingTemplate || isImporting}
                    >
                      {isDownloadingTemplate ? <CircularProgress size={20} /> : <Download />}
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title={t('importAktsPage.info')} arrow>
                  <IconButton color="secondary" onClick={() => setInfoModal(true)}>
                    <QuestionMark />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        {/* PDF preview & Upload dropzone */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {isUploadingPdf && (
            <Alert severity="info" icon={<CircularProgress size={16} color="inherit" />} sx={{ mb: 1, py: 0.5 }}>
              PDF fayli serverga yuklanmoqda...
            </Alert>
          )}

          {!isUploadingPdf && pdfFile && fileIdOnBilling && (
            <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
              <Chip
                icon={<CheckCircleOutlined fontSize="small" />}
                label="PDF serverga yuklandi"
                color="success"
                size="small"
                variant="outlined"
              />
              <Button
                size="small"
                color="error"
                startIcon={<Clear />}
                disabled={isImporting}
                onClick={() => setPdfFile([])}
              >
                PDF faylini almashtirish
              </Button>
            </Stack>
          )}

          <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
            {pdfFile === null ? (
              <FileInputDrop
                fileType="pdf"
                setFiles={(files) => {
                  if (files) setPdfFile(Array.from(files));
                }}
                clearTrigger={false}
              />
            ) : (
              <PdfViewer base64String={pdfFileUrl} />
            )}
          </Box>
        </Grid>
      </Grid>
      <ImportAktInfo handleClose={() => setInfoModal(false)} open={infoModal} />
    </MainCard>
  );
}

export default ImportAkt;
