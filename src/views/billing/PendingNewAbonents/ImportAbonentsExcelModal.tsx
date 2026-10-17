import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  FormControlLabel,
  Switch,
  CircularProgress,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { IconX, IconFileSpreadsheet, IconDownload, IconUpload, IconPlayerPlay, IconPlayerStop, IconHistory } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useTariff } from 'hooks/useTariff';
import { IAbonentImport, IAbonentImportRow } from './types';

interface ImportAbonentsExcelModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'preview' | 'progress';

const ROW_STATUS: Record<IAbonentImportRow['status'], { label: string; color: 'default' | 'success' | 'error' | 'warning' | 'info' }> = {
  invalid: { label: 'Xato', color: 'error' },
  pending: { label: 'Tayyor', color: 'info' },
  processing: { label: 'Ochilmoqda', color: 'warning' },
  created: { label: 'Ochildi', color: 'success' },
  failed: { label: 'Xatolik', color: 'error' },
  skipped: { label: "O'tkazildi", color: 'default' }
};

const IMPORT_STATUS: Record<IAbonentImport['status'], string> = {
  draft: 'Tekshirildi',
  queued: 'Navbatda',
  running: 'Ishlamoqda',
  completed: 'Tugadi',
  cancelled: "To'xtatildi",
  failed: 'Xatolik'
};

const ACTIVE_STATUSES: IAbonentImport['status'][] = ['queued', 'running'];

const downloadBlob = (data: BlobPart, fileName: string) => {
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const ImportAbonentsExcelModal: React.FC<ImportAbonentsExcelModalProps> = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentTariff } = useTariff();
  const tariffRate = currentTariff?.hisoblandi || 0;

  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [importDoc, setImportDoc] = useState<IAbonentImport | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [recent, setRecent] = useState<IAbonentImport[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createdCountRef = useRef(0);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setImportDoc(null);
    setOnlyProblems(false);
    setUploading(false);
    setStarting(false);
    createdCountRef.current = 0;
  };

  const loadRecent = useCallback(async () => {
    try {
      const res = await api.get('/pendingNewAbonents/imports', { headers: { 'hide-error': true } });
      setRecent(res.data?.data || []);
    } catch (e) {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    if (open) loadRecent();
    else reset();
  }, [open, loadRecent]);

  // Jarayon davomida natijani so'rab turish
  const importId = importDoc?._id;
  const importStatus = importDoc?.status;
  useEffect(() => {
    if (step !== 'progress' || !importId || !importStatus || !ACTIVE_STATUSES.includes(importStatus)) return;
    const timer = setInterval(async () => {
      try {
        const res = await api.get(`/pendingNewAbonents/import/${importId}`, { headers: { 'hide-error': true } });
        const doc: IAbonentImport = res.data?.data;
        if (!doc) return;
        setImportDoc(doc);
        if (doc.createdCount > createdCountRef.current) {
          createdCountRef.current = doc.createdCount;
          onSuccess();
        }
        if (!ACTIVE_STATUSES.includes(doc.status)) {
          if (doc.status === 'completed') toast.success(`Import tugadi: ${doc.createdCount} ta abonent ochildi`);
          if (doc.status === 'failed') toast.error(doc.failReason || 'Import xatolik bilan tugadi');
        }
      } catch (e) {
        // keyingi so'rovda qayta urinadi
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [step, importId, importStatus, onSuccess]);

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/pendingNewAbonents/import/template', { responseType: 'blob' });
      downloadBlob(res.data, 'yangi_abonentlar_shablon.xlsx');
    } catch (e) {
      toast.error('Shablonni yuklab olishda xatolik');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning('Avval Excel faylni tanlang');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/pendingNewAbonents/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportDoc(res.data.data);
      setStep('preview');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Faylni tekshirishda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    if (!importDoc) return;
    setStarting(true);
    try {
      const res = await api.post(`/pendingNewAbonents/import/${importDoc._id}/start`, { tariffRate });
      setImportDoc(res.data.data);
      setStep('progress');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Importni boshlashda xatolik');
    } finally {
      setStarting(false);
    }
  };

  const handleCancel = async () => {
    if (!importDoc) return;
    try {
      const res = await api.post(`/pendingNewAbonents/import/${importDoc._id}/cancel`);
      setImportDoc((prev) => (prev ? { ...prev, status: res.data.data.status } : prev));
      toast.info("Import to'xtatildi");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "To'xtatishda xatolik");
    }
  };

  const handleDownloadResult = async () => {
    if (!importDoc) return;
    try {
      const res = await api.get(`/pendingNewAbonents/import/${importDoc._id}/result`, { responseType: 'blob' });
      downloadBlob(res.data, `abonent_import_natija.xlsx`);
    } catch (e) {
      toast.error('Natijani yuklab olishda xatolik');
    }
  };

  const openRecent = async (id: string) => {
    try {
      const res = await api.get(`/pendingNewAbonents/import/${id}`);
      setImportDoc(res.data.data);
      createdCountRef.current = res.data.data.createdCount;
      setStep('progress');
    } catch (e) {
      toast.error('Importni ochib bo‘lmadi');
    }
  };

  const rows = importDoc?.rows || [];
  const counts = useMemo(
    () => ({
      valid: rows.filter((r) => r.status === 'pending').length,
      invalid: rows.filter((r) => r.status === 'invalid').length,
      warnings: rows.filter((r) => r.status !== 'invalid' && r.rowWarnings.length > 0).length
    }),
    [rows]
  );
  const visibleRows = onlyProblems ? rows.filter((r) => r.rowErrors.length || r.rowWarnings.length || r.status === 'failed') : rows;

  const isActive = importDoc ? ACTIVE_STATUSES.includes(importDoc.status) : false;
  const progressValue = importDoc && importDoc.total ? Math.round((importDoc.processed / importDoc.total) * 100) : 0;
  const canClose = !uploading && !starting;

  const renderRowsTable = () => (
    <TableContainer
      sx={{ maxHeight: isMobile ? 'none' : 420, border: '1px solid', borderColor: theme.palette.divider, borderRadius: '10px' }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Qator</TableCell>
            <TableCell>Holat</TableCell>
            <TableCell>JSHSHIR</TableCell>
            <TableCell>F.I.Sh.</TableCell>
            <TableCell>Mahalla / Ko'cha</TableCell>
            <TableCell align="center">Yashovchi</TableCell>
            <TableCell>Hisob raqami</TableCell>
            <TableCell sx={{ minWidth: 240 }}>Izoh</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row) => {
            const st = ROW_STATUS[row.status];
            const fullName = row.fullName || [row.lastName, row.firstName, row.patronymic].filter(Boolean).join(' ');
            return (
              <TableRow
                key={row.rowNumber}
                sx={{
                  bgcolor:
                    row.status === 'invalid' || row.status === 'failed'
                      ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.05)
                      : undefined
                }}
              >
                <TableCell>{row.rowNumber}</TableCell>
                <TableCell>
                  <Chip size="small" label={st.label} color={st.color} variant={row.status === 'pending' ? 'outlined' : 'filled'} />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.pnfl}</TableCell>
                <TableCell>
                  {fullName || (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      JSHSHIR orqali
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.mahallaName || row.mahallaRaw}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {row.streetName || row.streetRaw}
                    {row.homeNumber ? `, ${row.homeNumber}-uy` : ''}
                    {row.flatNumber ? `, ${row.flatNumber}-xonadon` : ''}
                  </Typography>
                </TableCell>
                <TableCell align="center">{row.inhabitantCnt ?? '—'}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.accountNumber || ''}</TableCell>
                <TableCell>
                  {row.message && (row.status === 'created' || row.status === 'failed') && (
                    <Typography variant="caption" sx={{ display: 'block', color: row.status === 'failed' ? 'error.main' : 'success.main' }}>
                      {row.message}
                    </Typography>
                  )}
                  {row.rowErrors.map((e) => (
                    <Typography key={e} variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                      {e}
                    </Typography>
                  ))}
                  {row.rowWarnings.map((w) => (
                    <Typography key={w} variant="caption" sx={{ display: 'block', color: 'warning.main' }}>
                      {w}
                    </Typography>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
          {visibleRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                  Ko'rsatish uchun qator yo'q
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Dialog open={open} onClose={canClose ? onClose : undefined} maxWidth="lg" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                color: theme.palette.success.main
              }}
            >
              <IconFileSpreadsheet size={24} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Excel orqali abonent ochish
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Shablonni to'ldiring, yuklang, tekshiring va tizim hisob raqamlarini o'zi ochib chiqadi
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose} disabled={!canClose}>
            <IconX size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {step === 'upload' && (
          <Stack spacing={2.5}>
            <Alert severity="info" variant="outlined">
              Majburiy ustunlar: <b>JSHSHIR</b>, <b>Mahalla</b> (nomi yoki ID), <b>Ko'cha</b> (nomi yoki ID) va <b>Yashovchilar soni</b>.
              F.I.Sh. bo'sh qolsa, JSHSHIR orqali TozaMakondan olinadi. Mahalla va ko'chalar ID lari shablonning qo'shimcha varaqlarida bor.
              Bir martada ko'pi bilan 1000 ta qator.
            </Alert>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<IconDownload size={18} />}
                onClick={handleDownloadTemplate}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Shablonni yuklab olish
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<IconUpload size={18} />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {file ? file.name : 'Excel faylni tanlash'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                hidden
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  e.target.value = '';
                }}
              />
            </Stack>

            {recent.length > 0 && (
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <IconHistory size={18} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Oxirgi importlar
                  </Typography>
                </Stack>
                <Stack spacing={0.75}>
                  {recent.map((r) => (
                    <Box
                      key={r._id}
                      onClick={() => openRecent(r._id)}
                      sx={{
                        p: 1.25,
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.fileName || 'Excel'} · {new Date(r.createdAt).toLocaleString('uz-UZ')}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {r.createdCount} ochildi · {r.failedCount} xato · {r.total} jami
                          </Typography>
                          <Chip
                            size="small"
                            label={IMPORT_STATUS[r.status]}
                            color={ACTIVE_STATUSES.includes(r.status) ? 'warning' : 'default'}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}

        {step === 'preview' && importDoc && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Chip color="success" label={`Ochishga tayyor: ${counts.valid}`} />
              <Chip color="error" label={`Xato: ${counts.invalid}`} />
              <Chip color="warning" variant="outlined" label={`Ogohlantirish: ${counts.warnings}`} />
              <Box sx={{ flexGrow: 1 }} />
              <FormControlLabel
                control={<Switch size="small" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} />}
                label="Faqat muammoli qatorlar"
              />
            </Stack>
            {counts.invalid > 0 && (
              <Alert severity="warning">
                Xato qatorlar ochilmaydi. Ularni Excelda tuzatib qayta yuklashingiz yoki faqat to'g'ri qatorlar bilan davom etishingiz
                mumkin.
              </Alert>
            )}
            {counts.valid > 0 && rows.some((r) => r.status === 'pending' && r.debtMonths) && !tariffRate && (
              <Alert severity="warning">Joriy tarif topilmadi, qarzdorlik summasi 0 bo'ladi.</Alert>
            )}
            {renderRowsTable()}
          </Stack>
        )}

        {step === 'progress' && importDoc && (
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75, alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {IMPORT_STATUS[importDoc.status]}: {importDoc.processed} / {importDoc.total}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {importDoc.createdCount} ta ochildi · {importDoc.failedCount} ta xato
                </Typography>
              </Stack>
              <LinearProgress
                variant={importDoc.status === 'queued' ? 'indeterminate' : 'determinate'}
                value={progressValue}
                color={importDoc.failedCount > 0 ? 'warning' : 'success'}
                sx={{ height: 8, borderRadius: 4 }}
              />
              {isActive && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
                  Oynani yopsangiz ham jarayon fonda davom etadi. Natijani "Oxirgi importlar" ro'yxatidan ochishingiz mumkin.
                </Typography>
              )}
              {importDoc.status === 'failed' && importDoc.failReason && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {importDoc.failReason}
                </Alert>
              )}
            </Box>
            <FormControlLabel
              control={<Switch size="small" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} />}
              label="Faqat muammoli qatorlar"
            />
            {renderRowsTable()}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: 1, flexWrap: 'wrap' }}>
        {step === 'upload' && (
          <Button
            variant="contained"
            color="success"
            onClick={handleUpload}
            disabled={!file || uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <IconUpload size={18} />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {uploading ? 'Tekshirilmoqda...' : 'Yuklash va tekshirish'}
          </Button>
        )}

        {step === 'preview' && (
          <>
            <Button color="inherit" onClick={reset} disabled={starting} sx={{ textTransform: 'none' }}>
              Boshqa fayl
            </Button>
            <Button variant="outlined" startIcon={<IconDownload size={18} />} onClick={handleDownloadResult} sx={{ textTransform: 'none' }}>
              Tekshiruv natijasi (Excel)
            </Button>
            <Tooltip title={counts.valid === 0 ? "Ochish uchun to'g'ri qator yo'q" : ''}>
              <span>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleStart}
                  disabled={starting || counts.valid === 0}
                  startIcon={starting ? <CircularProgress size={16} color="inherit" /> : <IconPlayerPlay size={18} />}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {counts.valid} ta abonentni ochish
                </Button>
              </span>
            </Tooltip>
          </>
        )}

        {step === 'progress' && (
          <>
            {isActive && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<IconPlayerStop size={18} />}
                onClick={handleCancel}
                sx={{ textTransform: 'none' }}
              >
                To'xtatish
              </Button>
            )}
            <Button variant="outlined" startIcon={<IconDownload size={18} />} onClick={handleDownloadResult} sx={{ textTransform: 'none' }}>
              Natijani yuklab olish
            </Button>
            {!isActive && (
              <Button
                color="inherit"
                onClick={() => {
                  reset();
                  loadRecent();
                }}
                sx={{ textTransform: 'none' }}
              >
                Yangi import
              </Button>
            )}
            <Button variant="contained" onClick={onClose} sx={{ textTransform: 'none' }}>
              Yopish
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
