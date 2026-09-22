import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  QrCodeScanner as QrIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import FileInputDrop from 'ui-component/FileInputDrop';
import { extractQRCodeFromPDF } from 'views/tools/extractQRCodeFromPDF';
import { INewAbonentItem } from './types';
import { numberToWordsUz } from './helpers/numberToWordsUz';

interface ImportScannedAbonentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportScannedAbonentModal: React.FC<ImportScannedAbonentModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [detectedData, setDetectedData] = useState<{ id: string; docNum: string } | null>(null);
  const [detectedAbonent, setDetectedAbonent] = useState<INewAbonentItem | null>(null);
  const [fetchingAbonent, setFetchingAbonent] = useState<boolean>(false);

  // Sozlanadigan maydonlar
  const [ignoreCadastr, setIgnoreCadastr] = useState<boolean>(false);
  const [cadastr, setCadastr] = useState<string>('');
  const [nSaldo, setNSaldo] = useState<number>(0);
  const [debtMonths, setDebtMonths] = useState<number>(0);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleReset = () => {
    setSelectedFile(null);
    setScanning(false);
    setDetectedData(null);
    setDetectedAbonent(null);
    setFetchingAbonent(false);
    setIgnoreCadastr(false);
    setCadastr('');
    setNSaldo(0);
    setDebtMonths(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setScanning(true);
    setDetectedData(null);
    setDetectedAbonent(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Avval 1-sahifani tekshiramiz
      let qrRes = await extractQRCodeFromPDF(new Uint8Array(arrayBuffer), 1);
      // Agar 1-sahifada topilmasa, oxirgi sahifani tekshiramiz
      if (!qrRes.ok) {
        qrRes = await extractQRCodeFromPDF(new Uint8Array(arrayBuffer), 'lastPage');
      }

      if (!qrRes.ok || !qrRes.result) {
        toast.error('Fayldan QR kod aniqlanmadi. Iltimos, QR kod aniq ko‘ringan hujjatni yuklang.');
        setScanning(false);
        return;
      }

      const qrText = qrRes.result.trim();
      // Kutilayotgan format: new_abonent_{id}_{docNumber}
      if (!qrText.startsWith('new_abonent_')) {
        toast.error(`Noma’lum QR kod formati: ${qrText}`);
        setScanning(false);
        return;
      }

      const parts = qrText.split('_');
      // parts[0] = 'new', parts[1] = 'abonent', parts[2] = id, parts[3] = docNum
      const id = parts[2];
      const docNum = parts[3] || '0';

      if (!id) {
        toast.error('QR kod ichida ariza ID raqami topilmadi');
        setScanning(false);
        return;
      }

      setDetectedData({ id, docNum });
      toast.info(`QR kod aniqlandi (Hujjat № ${docNum}). Maʼlumotlar yuklanmoqda...`);

      // Backenddan arizani olamiz
      setFetchingAbonent(true);
      try {
        const res = await api.get(`/pendingNewAbonents/${id}`);
        if (res.data?.ok && res.data?.data) {
          const abonent: INewAbonentItem = res.data.data;
          setDetectedAbonent(abonent);
          setCadastr(abonent.cadastr || '');
          setNSaldo(abonent.nSaldo ?? 0);
          setDebtMonths(abonent.debtMonths ?? 0);
          toast.success('Ariza ma’lumotlari muvaffaqiyatli topildi!');
        } else {
          toast.error(res.data?.message || 'Ariza ma’lumotlarini olish imkoni bo‘lmadi');
        }
      } catch (fetchErr: any) {
        toast.error(fetchErr?.response?.data?.message || 'Arizani bazadan yuklashda xatolik');
      } finally {
        setFetchingAbonent(false);
      }
    } catch (err: any) {
      console.error('QR o‘qish xatosi:', err);
      toast.error('Hujjatni tahlil qilishda xatolik yuz berdi');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmAndCreateAbonent = async () => {
    if (!detectedData?.id || !selectedFile) {
      toast.error('Yuklangan hujjat yoki ariza ma’lumotlari to‘liq emas');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('id', detectedData.id);
      formData.append('docNum', detectedData.docNum);
      formData.append('ignoreCadastr', String(ignoreCadastr));
      if (!ignoreCadastr && cadastr.trim()) {
        formData.append('cadastr', cadastr.trim());
      }
      formData.append('nSaldo', String(nSaldo));
      formData.append('debtMonths', String(debtMonths));

      const res = await api.post('/pendingNewAbonents/import-scanned-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.ok) {
        toast.success(
          res.data.message || `Abonent muvaffaqiyatli ochildi! Hisob raqami: ${res.data.accountNumber || ''}`,
          { autoClose: 6000 }
        );
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      } else {
        toast.error(res.data?.message || 'Abonent ochishda xatolik');
      }
    } catch (err: any) {
      console.error('Tasdiqlashda xatolik:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Abonent yaratishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const citizen = detectedAbonent?.citizen;
  const citizenFio = citizen
    ? `${citizen.lastName} ${citizen.firstName} ${citizen.patronymic || ''}`.trim()
    : detectedAbonent?.abonent_name || '-';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.16)' : 'rgba(76, 175, 80, 0.08)',
                color: theme.palette.success.main,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <QrIcon />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Skanerlangan asoslantiruvchi hujjat orqali abonent ochish
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                QR-kodli bildirishnoma yoki dalolatnomani yuklang — tizim arizani avtomatik topib ochadi
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack direction="column" spacing={2.5}>
          {/* Fayl yuklash qismi */}
          {!detectedAbonent ? (
            <Box>
              <FileInputDrop
                setFiles={handleFileChange}
                clearTrigger={!selectedFile}
                fileType="pdf"
                accept="application/pdf"
              />

              {scanning && (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', mt: 3 }}>
                  <CircularProgress size={22} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Fayldan QR-kod qidirilmoqda va tahlil qilinmoqda...
                  </Typography>
                </Stack>
              )}

              {fetchingAbonent && (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={22} color="secondary" />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Abonent arizasi maʼlumotlari bazadan yuklanmoqda...
                  </Typography>
                </Stack>
              )}
            </Box>
          ) : (
            /* Aniqlangan abonent ma'lumotlari kartasi */
            <Box>
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                action={
                  <Button color="inherit" size="small" onClick={handleReset}>
                    Boshqa fayl
                  </Button>
                }
                sx={{ mb: 2.5 }}
              >
                <b>QR kod muvaffaqiyatli aniqlandi!</b> Hujjat № {detectedAbonent.document_number || detectedData?.docNum}
              </Alert>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Ariza maʼlumotlari
                </Typography>

                <Stack direction="column" spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Fuqaro F.I.SH.
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {citizenFio}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        JSHSHIR
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {citizen?.pnfl || '-'}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Pasport
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {citizen?.passport || '-'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Mahalla va ko‘cha
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {detectedAbonent.mahallaName}, {detectedAbonent.streetName}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Yashovchilar soni
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {detectedAbonent.inhabitant_cnt} nafar
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Nazoratchi
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {detectedAbonent.inspector_name || '-'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  {/* Qarzdorlik va Kadastr sozlash */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Tasdiqlash parametrlari
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
                    <TextField
                      label="Qarzdorlik (Necha oylik)"
                      type="number"
                      size="small"
                      value={debtMonths}
                      onChange={(e) => setDebtMonths(Math.max(0, Number(e.target.value)))}
                      sx={{ flex: 1 }}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">oy</InputAdornment>,
                        },
                      }}
                    />

                    <TextField
                      label="Boshlang‘ich qoldiq (nSaldo)"
                      type="number"
                      size="small"
                      value={nSaldo}
                      onChange={(e) => setNSaldo(Math.max(0, Number(e.target.value)))}
                      sx={{ flex: 1.5 }}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">so‘m</InputAdornment>,
                        },
                      }}
                      helperText={nSaldo > 0 ? `So‘z bilan: ${numberToWordsUz(nSaldo)} so‘m` : 'Qarzdorliksiz'}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
                    <TextField
                      label="Kadastr raqami"
                      size="small"
                      value={cadastr}
                      disabled={ignoreCadastr}
                      onChange={(e) => setCadastr(e.target.value)}
                      sx={{ flex: 1 }}
                      placeholder="12:34:56:78:90:1234"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={ignoreCadastr}
                          onChange={(e) => setIgnoreCadastr(e.target.checked)}
                          color="warning"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          Kadastr raqamisiz ochish (null)
                        </Typography>
                      }
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: theme.palette.divider }}>
        <Button onClick={handleClose} color="inherit" disabled={submitting}>
          Bekor qilish
        </Button>
        {detectedAbonent && (
          <Button
            variant="contained"
            color="success"
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
            onClick={handleConfirmAndCreateAbonent}
            disabled={submitting}
            sx={{ px: 3, fontWeight: 600 }}
          >
            Abonentni Ochish va Tasdiqlash
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportScannedAbonentModal;
