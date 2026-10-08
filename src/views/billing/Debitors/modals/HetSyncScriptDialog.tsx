import React, { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface HetSyncScriptDialogProps {
  open: boolean;
  onClose: () => void;
}

interface CaotoOption {
  _id?: string;
  title: string;
  caoto: number;
  region?: number;
  companyId?: number;
}

const USAGE_STEPS = [
  'HET saytiga kiring (het.xdevs.uz).',
  "Developer Tools (F12) → Network bo'limi orqali o'z Bearer Tokeningizni oling.",
  "Quyidagi scriptni nusxalab, Developer Tools → Console bo'limiga joylashtiring.",
  "Script so'raganda Bearer Tokenni kiriting.",
  'Import jarayoni avtomatik boshlanadi.'
];

export default function HetSyncScriptDialog({ open, onClose }: HetSyncScriptDialogProps) {
  const theme = useTheme();
  const [caotoList, setCaotoList] = useState<CaotoOption[]>([]);
  const [countsByCaoto, setCountsByCaoto] = useState<Record<string, number>>({});
  const [fetchingCaotos, setFetchingCaotos] = useState(false);

  const [caoto, setCaoto] = useState<number | string>('');
  const [selectedCaotoCount, setSelectedCaotoCount] = useState<number | null>(null);
  const [fetchingCount, setFetchingCount] = useState(false);

  const [limit, setLimit] = useState<number | string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setGeneratedScript('');
      setCopied(false);
      setError(null);
      return;
    }
    let active = true;
    const loadInitialData = async () => {
      setFetchingCaotos(true);
      setError(null);
      try {
        const [caotosRes, countsRes] = await Promise.all([
          api.get('/caotos'),
          api.get('/debitors/sync-script-count').catch(() => ({ data: null }))
        ]);
        if (!active) return;
        if (caotosRes.data?.ok) {
          setCaotoList(caotosRes.data.data || []);
        }
        if (countsRes.data?.countsByCaoto) {
          setCountsByCaoto(countsRes.data.countsByCaoto);
        }
      } catch (err) {
        console.error('CAOTO kodlarni yuklashda xatolik:', err);
      } finally {
        if (active) setFetchingCaotos(false);
      }
    };
    loadInitialData();
    return () => {
      active = false;
    };
  }, [open]);

  // Fetch exact count when CAOTO is selected
  useEffect(() => {
    setGeneratedScript('');
    setCopied(false);
    if (!open || !caoto) {
      setSelectedCaotoCount(null);
      return;
    }
    let active = true;
    const fetchCountForCaoto = async () => {
      setFetchingCount(true);
      try {
        const res = await api.get('/debitors/sync-script-count', {
          params: { caoto }
        });
        if (active && typeof res.data?.count === 'number') {
          setSelectedCaotoCount(res.data.count);
          setCountsByCaoto((prev) => ({ ...prev, [String(caoto)]: res.data.count }));
        }
      } catch (err) {
        console.error('Debitorlar sonini olishda xatolik:', err);
      } finally {
        if (active) setFetchingCount(false);
      }
    };
    fetchCountForCaoto();
    return () => {
      active = false;
    };
  }, [open, caoto]);

  // Unique CAOTOs by removing duplicate caoto numbers across multiple companies
  const uniqueCaotos = useMemo(
    () => Array.from(new Map(caotoList.map((item) => [item.caoto, item])).values()),
    [caotoList]
  );

  const effectiveScriptCount = useMemo(() => {
    if (selectedCaotoCount === null) return null;
    const parsedLimit = Number(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      return Math.min(selectedCaotoCount, parsedLimit);
    }
    return selectedCaotoCount;
  }, [selectedCaotoCount, limit]);

  const handleGenerateScript = async () => {
    if (!caoto) {
      setError('Iltimos, CAOTO kodini tanlang.');
      return;
    }
    setError(null);
    setLoading(true);
    setCopied(false);

    try {
      const response = await api.get('/debitors/download-sync-script', {
        params: {
          caoto,
          limit: limit || undefined
        },
        responseType: 'text'
      });

      const scriptText =
        typeof response.data === 'string' ? response.data : String(response.data || '');

      if (!scriptText.trim()) {
        setError("Skript ma'lumotlari bo'sh qaytdi.");
        return;
      }

      setGeneratedScript(scriptText);
      toast.success('Maxsus HET script muvaffaqiyatli yaratildi!');
    } catch (err: any) {
      console.error('Script yaratishda xatolik:', err);
      const backendMsg = err?.response?.data?.message;
      setError(
        backendMsg ||
          "Skriptni yaratishda xatolik yuz berdi. Tashkilotingiz Premium tarifda ekanligini tekshiring."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = async () => {
    if (!generatedScript) return;
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      toast.success("Script nusxalandi! Endi HET Console'ga joylashtirishingiz mumkin.");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      toast.error('Nusxalashda xatolik yuz berdi');
    }
  };

  const handleDownloadFile = () => {
    if (!generatedScript) return;
    const blob = new Blob([generatedScript], { type: 'application/javascript;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `het_sync_${caoto}_${dateStr}.js`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.info('Skript fayl sifatida yuklab olindi (.js)');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <BoltOutlinedIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Maxsus HET Script Generator
          </Typography>
          <Chip
            icon={<LockOutlinedIcon sx={{ fontSize: '13px !important' }} />}
            label="Premium · AES-GCM"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
          />
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Qisqa foydalanish yo'riqnomasi + Batafsil PDF qo'llanma */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.14 : 0.06),
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.28)
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 1.25 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                📋 Foydalanish yo&apos;riqnomasi:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  component="a"
                  href="/docs/het-import-qollanma.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  color="info"
                  startIcon={<OpenInNewOutlinedIcon fontSize="small" />}
                  sx={{ fontSize: 12, fontWeight: 600, py: 0.35, textTransform: 'none' }}
                >
                  Batafsil qo&apos;llanmani ko&apos;rish (PDF)
                </Button>
                <Button
                  component="a"
                  href="/docs/het-import-qollanma.pdf"
                  download="HET_Import_Amaliy_Qollanma.pdf"
                  size="small"
                  variant="contained"
                  color="info"
                  startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                  sx={{ fontSize: 12, fontWeight: 600, py: 0.35, textTransform: 'none' }}
                >
                  Yuklab olish (PDF)
                </Button>
              </Stack>
            </Stack>
            <Stack spacing={0.5}>
              {USAGE_STEPS.map((step, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, fontSize: 13, lineHeight: 1.5 }}
                >
                  <b>{index + 1}.</b> {step}
                </Typography>
              ))}
            </Stack>
          </Box>

          {error && (
            <Box
              sx={{
                bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.3),
                p: 1.5,
                borderRadius: 1.5
              }}
            >
              <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                {error}
              </Typography>
            </Box>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="CAOTO bo'limi"
              value={caoto}
              onChange={(e) => setCaoto(e.target.value)}
              fullWidth
              required
              disabled={fetchingCaotos}
              slotProps={{
                input: {
                  endAdornment: fetchingCaotos ? <CircularProgress size={18} sx={{ mr: 2 }} /> : undefined
                }
              }}
            >
              <MenuItem value="" disabled>
                CAOTO bo&apos;limini tanlang
              </MenuItem>
              {uniqueCaotos.map((option) => {
                const itemCount = countsByCaoto[String(option.caoto)] ?? 0;
                return (
                  <MenuItem key={option.caoto} value={option.caoto}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Typography variant="body2">
                        {option.title} ({option.caoto})
                      </Typography>
                      <Chip
                        label={`${itemCount} ta`}
                        size="small"
                        color={itemCount > 0 ? 'primary' : 'default'}
                        variant={itemCount > 0 ? 'filled' : 'outlined'}
                        sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                      />
                    </Stack>
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              label="Debitorlar soni cheklovi (Optional)"
              type="number"
              placeholder="Barchasi (bo'sh qoldiring)"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                setGeneratedScript('');
              }}
              fullWidth
              helperText="Bo'sh qoldirilsa, barcha tayyor ma'lumotlar kiritiladi"
            />
          </Stack>

          {caoto && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor:
                  selectedCaotoCount === 0
                    ? alpha(theme.palette.warning.main, 0.4)
                    : alpha(theme.palette.primary.main, 0.3),
                bgcolor:
                  selectedCaotoCount === 0
                    ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)
                    : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.06)
              }}
            >
              {fetchingCount ? (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Ma&apos;lumotlar soni hisoblanmoqda...
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    {selectedCaotoCount === 0 ? (
                      <InfoOutlinedIcon color="warning" fontSize="small" />
                    ) : (
                      <PeopleAltOutlinedIcon color="primary" fontSize="small" />
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Skriptga kiritiladigan ma&apos;lumotlar soni
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {selectedCaotoCount === 0
                          ? "Ushbu CAOTO kodi bo'yicha sinxronizatsiya kutilayotgan abonentlar topilmadi"
                          : limit && Number(limit) > 0 && Number(limit) < (selectedCaotoCount || 0)
                            ? `Jami mavjud: ${selectedCaotoCount} ta (cheklov bo'yicha ${effectiveScriptCount} ta olinadi)`
                            : 'Barcha tashkilotlar kesimida ushbu CAOTO kodiga tegishli hisob raqamlar'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={`${effectiveScriptCount ?? 0} ta`}
                    color={selectedCaotoCount === 0 ? 'warning' : 'primary'}
                    sx={{ fontWeight: 800, fontSize: 13 }}
                  />
                </Stack>
              )}
            </Box>
          )}

          {/* Generated Script Viewer & Copy / Download UX */}
          {generatedScript && (
            <Box
              sx={{
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme.palette.background.paper
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  px: 2,
                  py: 1.25,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04),
                  flexWrap: 'wrap'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Tayyor shifrlangan skript
                  </Typography>
                  <Chip
                    label={`${(generatedScript.length / 1024).toFixed(1)} KB`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: 11 }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant={copied ? 'contained' : 'outlined'}
                    color={copied ? 'success' : 'primary'}
                    startIcon={
                      copied ? <CheckOutlinedIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />
                    }
                    onClick={handleCopyScript}
                    sx={{ fontWeight: 600, textTransform: 'none' }}
                  >
                    {copied ? 'Nusxalandi!' : 'Nusxa olish (Copy)'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<DownloadOutlinedIcon fontSize="small" />}
                    onClick={handleDownloadFile}
                    sx={{ fontWeight: 600, textTransform: 'none' }}
                  >
                    Yuklab olish (.js)
                  </Button>
                </Stack>
              </Stack>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  maxHeight: 280,
                  overflow: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: theme.palette.text.primary,
                  bgcolor: theme.palette.background.default,
                  userSelect: 'all',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {generatedScript}
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Yopish
        </Button>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {generatedScript && (
            <Button
              onClick={handleCopyScript}
              variant="outlined"
              color={copied ? 'success' : 'primary'}
              startIcon={
                copied ? <CheckOutlinedIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />
              }
            >
              {copied ? 'Nusxalandi!' : 'Scriptni nusxalash'}
            </Button>
          )}
          <Button
            onClick={handleGenerateScript}
            variant="contained"
            color="primary"
            loading={loading}
            startIcon={<BoltOutlinedIcon fontSize="small" />}
            disabled={loading || fetchingCaotos || fetchingCount || !caoto || selectedCaotoCount === 0}
          >
            {generatedScript ? 'Qayta yaratish' : 'Script yaratish'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
