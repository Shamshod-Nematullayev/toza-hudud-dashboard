import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close as CloseIcon, Print as PrintIcon, Description as DocIcon } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { reactToPrintDefaultOptions } from 'store/constant';
import useCustomizationStore from 'store/customizationStore';
import { INewAbonentItem } from './types';
import { numberToWordsUz } from './helpers/numberToWordsUz';
import BildirishnomaBlank from './Documents/BildirishnomaBlank';
import DalolatnomaBlank from './Documents/DalolatnomaBlank';

interface PrintNewAbonentDialogProps {
  open: boolean;
  onClose: () => void;
  item: INewAbonentItem | null;
  onDocumentCreated?: (updatedItem: INewAbonentItem) => void;
}

export const PrintNewAbonentDialog: React.FC<PrintNewAbonentDialogProps> = ({
  open,
  onClose,
  item,
  onDocumentCreated,
}) => {
  const theme = useTheme();
  const { company: userCompany } = useCustomizationStore();

  const [documentType, setDocumentType] = useState<'bildirishnoma' | 'dalolatnoma'>('bildirishnoma');
  const [debtMonths, setDebtMonths] = useState<number>(0);
  const [nSaldo, setNSaldo] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [savingDoc, setSavingDoc] = useState<boolean>(false);

  // Chop etish uchun olingan to'liq rekvizitlar
  const [printDetails, setPrintDetails] = useState<{
    company?: any;
    inspectorName?: string;
    mfyRaisName?: string;
    qrValue?: string;
  }>({});

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: `Hujjat_${item?._id || 'new_abonent'}`,
    contentRef: printRef,
  });

  // Modal ochilganda qiymatlarni to'ldirish
  useEffect(() => {
    if (open && item) {
      setDocumentType(item.document_type || 'bildirishnoma');
      setDebtMonths(item.debtMonths ?? 0);
      setNSaldo(item.nSaldo ?? 0);
      setComment(item.comment || '');

      setLoading(true);
      api
        .get(`/pendingNewAbonents/document-print/${item._id}`)
        .then((res) => {
          if (res.data?.ok && res.data?.data) {
            const d = res.data.data;
            setPrintDetails({
              company: d.company,
              inspectorName: d.inspectorName,
              mfyRaisName: d.mfyRaisName,
              qrValue: d.qrValue,
            });
          }
        })
        .catch((err) => {
          console.error('Hujjat rekvizitlarini olishda xatolik:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [open, item]);

  if (!item) return null;

  const calculatedDebtWords = nSaldo > 0 ? numberToWordsUz(nSaldo) : 'Nol';

  const handleCreateAndPrint = async () => {
    setSavingDoc(true);
    try {
      // Hujjat raqamini olish va statusni document_created qilish
      const res = await api.post('/pendingNewAbonents/create-document', {
        id: item._id,
        document_type: documentType,
        debtMonths: Number(debtMonths),
        nSaldo: Number(nSaldo),
        calculatedDebtWords,
        comment,
      });

      if (res.data?.ok && res.data?.data) {
        toast.success(res.data.message || 'Hujjat shakllantirildi!');
        const updated = res.data.data;
        if (onDocumentCreated) {
          onDocumentCreated(updated);
        }
        // QR kod qiymatini yangilaymiz
        setPrintDetails((prev) => ({
          ...prev,
          qrValue: `new_abonent_${updated._id}_${updated.document_number}`,
        }));

        // Chop etish dialogini chaqiramiz
        setTimeout(() => {
          handlePrint();
        }, 300);
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Hujjatni shakllantirishda xatolik');
    } finally {
      setSavingDoc(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 3,
            maxHeight: '92vh',
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
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.16)' : 'rgba(33, 150, 243, 0.08)',
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <DocIcon />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Asoslantiruvchi hujjat shakllantirish va chop etish
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {item.abonent_name || `${item.citizen.lastName} ${item.citizen.firstName}`} • {item.mahallaName}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
            {/* Chap tomondagi sozlamalar paneli */}
            <Box sx={{ width: { xs: '100%', md: '340px' }, flexShrink: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Hujjat parametrlari
                </Typography>

                <Stack direction="column" spacing={2.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Hujjat turi</InputLabel>
                    <Select
                      value={documentType}
                      label="Hujjat turi"
                      onChange={(e) => setDocumentType(e.target.value as any)}
                    >
                      <MenuItem value="bildirishnoma">Bildirishnoma (Tavsiya etiladi)</MenuItem>
                      <MenuItem value="dalolatnoma">Dalolatnoma (Komissiya)</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Qarzdorlik (Necha oylik)"
                    type="number"
                    size="small"
                    fullWidth
                    value={debtMonths}
                    onChange={(e) => setDebtMonths(Math.max(0, Number(e.target.value)))}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">oy</InputAdornment>,
                      },
                    }}
                  />

                  <TextField
                    label="Qayta hisoblangan summa"
                    type="number"
                    size="small"
                    fullWidth
                    value={nSaldo}
                    onChange={(e) => setNSaldo(Math.max(0, Number(e.target.value)))}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">so‘m</InputAdornment>,
                      },
                    }}
                    helperText={`So‘z bilan: ${calculatedDebtWords} so‘m`}
                  />

                  <TextField
                    label="Hujjatga izoh / Maqsad"
                    multiline
                    rows={3}
                    size="small"
                    fullWidth
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Masalan: Yangi xonadon aniqlandi..."
                  />

                  <Divider />

                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                      Nazoratchi: <b>{printDetails.inspectorName || item.inspector_name || '-'}</b>
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                      Kompaniya rahbari: <b>{printDetails.company?.managerName || userCompany?.manager || '-'}</b>
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                      Hujjat holati: <b>{item.document_number ? `№ ${item.document_number} (Chiqarilgan)` : 'Yangi'}</b>
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* O'ng tomondagi hujjat prevyusi (A4 ko'rinishi) */}
            <Box
              sx={{
                flex: 1,
                minHeight: 500,
                maxHeight: '65vh',
                overflow: 'auto',
                p: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#e0e0e0',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                ref={printRef}
                sx={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  transformOrigin: 'top center',
                }}
              >
                {documentType === 'bildirishnoma' ? (
                  <BildirishnomaBlank
                    item={item}
                    company={printDetails.company}
                    inspectorName={printDetails.inspectorName}
                    debtMonths={debtMonths}
                    nSaldo={nSaldo}
                    calculatedDebtWords={calculatedDebtWords}
                    comment={comment}
                    qrValue={printDetails.qrValue}
                  />
                ) : (
                  <DalolatnomaBlank
                    item={item}
                    company={printDetails.company}
                    inspectorName={printDetails.inspectorName}
                    mfyRaisName={printDetails.mfyRaisName}
                    debtMonths={debtMonths}
                    nSaldo={nSaldo}
                    calculatedDebtWords={calculatedDebtWords}
                    comment={comment}
                    qrValue={printDetails.qrValue}
                  />
                )}
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: theme.palette.divider }}>
        <Button onClick={onClose} color="inherit" disabled={savingDoc}>
          Yopish
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={savingDoc ? <CircularProgress size={18} color="inherit" /> : <PrintIcon />}
          onClick={handleCreateAndPrint}
          disabled={savingDoc || loading}
          sx={{ px: 3, fontWeight: 600 }}
        >
          {item.document_number ? 'Chop etish' : 'Hujjat yaratish va chop etish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintNewAbonentDialog;
