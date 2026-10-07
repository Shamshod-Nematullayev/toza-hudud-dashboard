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

  useEffect(() => {
    if (!open) return;
    let active = true;
    const loadInitialData = async () => {
      setFetchingCaotos(true);
      setError(null);
      try {
        const [caotosRes, countsRes] = await Promise.all([
          api.get('/caotos'),
          api.get('/product-admin/debitors/sync-script-count').catch(() => ({ data: null }))
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
    if (!open || !caoto) {
      setSelectedCaotoCount(null);
      return;
    }
    let active = true;
    const fetchCountForCaoto = async () => {
      setFetchingCount(true);
      try {
        const res = await api.get('/product-admin/debitors/sync-script-count', {
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

  const handleDownload = async () => {
    if (!caoto) {
      setError('Iltimos, CAOTO kodini tanlang.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await api.get('/product-admin/debitors/download-sync-script', {
        params: {
          caoto,
          limit: limit || undefined
        },
        responseType: 'blob'
      });

      // Trigger download in browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `het_sync_${caoto}_${dateStr}.js`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err: any) {
      console.error('Script yuklashda xatolik:', err);
      setError(
        "Skriptni yuklab olishda xatolik yuz berdi. Iltimos, server ishlayotganini va huquqingiz yetarli ekanligini tekshiring."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          HET Sinxronizatsiya Skriptini Yuklash
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Mazkur bo&apos;lim orqali HET bazasiga telefon raqamlarni import qilish uchun maxsus skript yaratiladi. Skriptni yuklab olgach, brauzer konsolida ishga tushirasiz (HET Bearer tokeni brauzerda skript ishga tushgan vaqtda so&apos;raladi).
          </Typography>

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

          <TextField
            label="Debitorlar soni cheklovi (Optional)"
            type="number"
            placeholder="Barchasi (bo'sh qoldiring)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            fullWidth
            helperText="Bo'sh qoldirilsa, tanlangan CAOTO bo'yicha barcha tayyor ma'lumotlar skriptga kiritiladi"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Bekor qilish
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          color="primary"
          loading={loading}
          disabled={loading || fetchingCaotos || fetchingCount || !caoto || selectedCaotoCount === 0}
        >
          Skriptni Yuklash (.js)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
