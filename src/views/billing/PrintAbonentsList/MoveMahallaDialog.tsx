import React, { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Paper
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';
import useStore from './useStore';
import useCustomizationStore from 'store/customizationStore';

interface MoveMahallaDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialFromMahallaId?: number | string;
}

interface MahallaOption {
  id: number;
  name: string;
}

export default function MoveMahallaDialog({
  open,
  onClose,
  onSuccess,
  initialFromMahallaId
}: MoveMahallaDialogProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { mahallas } = useStore();
  const { mahallalar: customMahallalar } = useCustomizationStore();

  const [fromMahalla, setFromMahalla] = useState<MahallaOption | null>(null);
  const [toMahalla, setToMahalla] = useState<MahallaOption | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  // Birlashtirilgan mahallalar ro'yxati (ID bo'yicha unikal)
  const mahallaOptions = useMemo<MahallaOption[]>(() => {
    const list: MahallaOption[] = [];
    const seen = new Set<number>();

    const sourceList = (mahallas && mahallas.length > 0 ? mahallas : customMahallalar) || [];
    sourceList.forEach((m: any) => {
      const id = Number(m.id);
      if (id && !seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          name: m.name || `Mahalla #${id}`
        });
      }
    });

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [mahallas, customMahallalar]);

  // Dastlabki tanlangan mahallani o'rnatish
  useEffect(() => {
    if (open && initialFromMahallaId) {
      const found = mahallaOptions.find((m) => m.id === Number(initialFromMahallaId));
      if (found) {
        setFromMahalla(found);
      }
    }
  }, [open, initialFromMahallaId, mahallaOptions]);

  // Matndan unikal raqamlarni (ID) ajratib olish
  const parsedIds = useMemo<number[]>(() => {
    if (!rawText.trim()) return [];
    const matches = rawText.match(/\b\d+\b/g) || [];
    const nums = matches.map(Number).filter((n) => !isNaN(n) && n > 0);
    return Array.from(new Set(nums));
  }, [rawText]);

  const handleSwapMahallas = () => {
    const temp = fromMahalla;
    setFromMahalla(toMahalla);
    setToMahalla(temp);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText((prev) => (prev ? prev + '\n' + text : text));
        toast.info("Buferdan matn qo'shildi");
      }
    } catch {
      toast.warning("Buferdan o'qish uchun ruxsat berilmadi, qo'lda tashlang (Ctrl+V)");
    }
  };

  const handleExecuteMove = async () => {
    if (!fromMahalla || !toMahalla) {
      toast.error('Iltimos, eski va yangi mahallani tanlang');
      return;
    }

    if (fromMahalla.id === toMahalla.id) {
      toast.error("Eski mahalla va yangi mahalla bir xil bo'lishi mumkin emas");
      return;
    }

    if (parsedIds.length === 0) {
      toast.error("Kamida bitta abonent ID si kiritilishi kerak");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<{ ok: boolean; message: string; movedCount: number }>('/abonents/move-mahalla', {
        fromMahallaId: fromMahalla.id,
        toMahallaId: toMahalla.id,
        residentIds: parsedIds
      });

      if (res.data?.ok) {
        toast.success(res.data.message || `${parsedIds.length} ta abonent muvaffaqiyatli ko'chirildi!`);
        if (onSuccess) {
          onSuccess();
        }
        setConfirmOpen(false);
        onClose();
        // State tozalash
        setRawText('');
      } else {
        toast.error(res.data?.message || "Ko'chirishda xatolik yuz berdi");
      }
    } catch (err: any) {
      console.error('Error moving residents mahalla:', err);
      const msg = err.response?.data?.message || err.message || "Toza Makon tizimida ko'chirishda xatolik yuz berdi";
      toast.error(msg);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <DraggableDialog
      open={open}
      title="Abonentlarni mahalladan-mahallaga ko'chirish"
      onClose={() => {
        if (!loading) onClose();
      }}
      maxWidth="md"
    >
      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Header Action Bar: Help Banner Toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.25,
              borderRadius: 2,
              bgcolor: isDark ? alpha(theme.palette.info.main, 0.12) : alpha(theme.palette.info.main, 0.06),
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.25)
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <DriveFileMoveOutlinedIcon color="info" fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Toza Makon API orqali ommaviy ko'chirish
              </Typography>
            </Stack>

            <Tooltip title={showHelp ? "Yordamni yopish" : "Qanday ishlatish bo'yicha batafsil yordam (?)"}>
              <Button
                size="small"
                variant={showHelp ? 'contained' : 'outlined'}
                color="info"
                startIcon={<HelpOutlineIcon fontSize="small" />}
                onClick={() => setShowHelp((prev) => !prev)}
                sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.2, px: 1.25 }}
              >
                {showHelp ? 'Yordamni yashirish' : 'Qo‘llanma (?)'}
              </Button>
            </Tooltip>
          </Box>

          {/* Help Collapse Information */}
          <Collapse in={showHelp}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: isDark ? 'background.paper' : 'grey.50'
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  📖 Funksiya haqida qo‘llanma va talablar
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  <b>1. Bu funksiya nima qiladi?</b>
                  <br />
                  Toza Makon (<code>api.tozamakon.eco/user-service/residents/move-mahalla</code>) tizimiga rasmiy so'rov
                  yuborib, ko'rsatilgan abonentlarni bir mahalladan ikkinchisiga ko'chiradi. Shu bilan birga, mahalliy
                  baza (GreenZone MongoDB)dagi ma'lumotlarni ham sinxron yangilaydi.
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  <b>2. Abonent ID raqamlarini qanday kiritish kerak?</b>
                  <br />
                  Abonent ID larini Excel ustunidan, hisobotdan yoki fayldan to'g'ridan-to'g'ri nusxalab (Ctrl+C) matn
                  maydoniga tashlang (Ctrl+V). Tizim matn ichidagi har qanday qator tashlashlar, vergullar, probellarni
                  avtomatik tozalab, faqat toza raqamlarni ajratib oladi va dublikatlarni olib tashlaydi.
                </Typography>

                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: isDark ? 'grey.900' : 'grey.200',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'text.primary'
                  }}
                >
                  Misol format:
                  <br />
                  20992064
                  <br />
                  20992056
                  <br />
                  20991999
                </Box>

                <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
                  ⚠️ Diqqat: Eski va yangi mahallalarni to'g'ri tanlaganingizga ishonch hosil qiling. Ko'chirish amalga
                  oshirilgach abonentlar Toza Makon tizimida rasman yangi mahallada hisobga olinadi.
                </Typography>
              </Stack>
            </Paper>
          </Collapse>

          {/* Mahalla Selection Controls */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
              gap: 1.5,
              alignItems: 'center'
            }}
          >
            {/* From Mahalla */}
            <Autocomplete
              size="small"
              options={mahallaOptions}
              value={fromMahalla}
              onChange={(_, newValue) => setFromMahalla(newValue)}
              getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Qaysi mahalladan (Eski mahalla) *"
                  placeholder="Mahalla nomini yoki ID sini qidiring..."
                />
              )}
            />

            {/* Swap Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Mahallalarni o'rnini almashtirish">
                <span>
                  <IconButton
                    onClick={handleSwapMahallas}
                    disabled={!fromMahalla && !toMahalla}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <SwapHorizIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            {/* To Mahalla */}
            <Autocomplete
              size="small"
              options={mahallaOptions}
              value={toMahalla}
              onChange={(_, newValue) => setToMahalla(newValue)}
              getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Qaysi mahallaga (Yangi mahalla) *"
                  placeholder="Mahalla nomini yoki ID sini qidiring..."
                  error={Boolean(fromMahalla && toMahalla && fromMahalla.id === toMahalla.id)}
                  helperText={
                    fromMahalla && toMahalla && fromMahalla.id === toMahalla.id
                      ? "Eski va yangi mahalla bir xil bo'lishi mumkin emas"
                      : undefined
                  }
                />
              )}
            />
          </Box>

          <Divider />

          {/* IDs Input Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Abonent ID raqamlari ro'yxati *
                </Typography>
                {parsedIds.length > 0 && (
                  <Chip
                    size="small"
                    color="primary"
                    icon={<CheckCircleOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                    label={`${parsedIds.length} ta aniqlandi`}
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<ContentPasteIcon fontSize="small" />}
                  onClick={handlePasteClipboard}
                  sx={{ textTransform: 'none', py: 0.2, px: 1, borderRadius: 1.5 }}
                >
                  Buferdan qo'shish
                </Button>
                {rawText && (
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    startIcon={<DeleteSweepIcon fontSize="small" />}
                    onClick={() => setRawText('')}
                    sx={{ textTransform: 'none', py: 0.2, px: 1 }}
                  >
                    Tozalash
                  </Button>
                )}
              </Stack>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Abonent ID raqamlarini bu yerga tashlang:\n20992064\n20992056\n20991999\n20991967\n20991938`}
              slotProps={{
                input: {
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }
              }}
              helperText={
                parsedIds.length > 0
                  ? `Jami ${parsedIds.length} ta unikal abonent aniqlandi`
                  : "Excel ustunidan nusxalab tashlasangiz bo'ladi (har bir qatorda bittadan ID)"
              }
            />
          </Box>

          {/* Parsed IDs Preview */}
          {parsedIds.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02)
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>
                Aniqlangan ID lar ko'rinishi (birinchi {Math.min(parsedIds.length, 12)} tasi):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {parsedIds.slice(0, 12).map((id) => (
                  <Chip
                    key={id}
                    label={id}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                ))}
                {parsedIds.length > 12 && (
                  <Chip
                    label={`+ yana ${parsedIds.length - 12} ta`}
                    size="small"
                    color="default"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </Paper>
          )}

          {/* Confirmation Warning Alert before Action */}
          {confirmOpen && (
            <Alert
              severity="warning"
              action={
                <IconButton size="small" onClick={() => setConfirmOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Ko'chirishni tasdiqlaysizmi?
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Haqiqatan ham <b>{parsedIds.length} ta</b> abonentni <b>"{fromMahalla?.name}"</b> mahallasidan{' '}
                <b>"{toMahalla?.name}"</b> mahallasiga o'tkazmoqchimisiz? Ushbu amal Toza Makon serverida bajariladi.
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Bekor qilish
        </Button>

        {!confirmOpen ? (
          <Button
            onClick={() => setConfirmOpen(true)}
            variant="contained"
            color="primary"
            disabled={
              loading ||
              !fromMahalla ||
              !toMahalla ||
              fromMahalla.id === toMahalla.id ||
              parsedIds.length === 0
            }
            startIcon={<DriveFileMoveOutlinedIcon />}
          >
            {parsedIds.length > 0 ? `${parsedIds.length} ta abonentni ko'chirish` : "Ko'chirish"}
          </Button>
        ) : (
          <Button
            onClick={handleExecuteMove}
            variant="contained"
            color="warning"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DriveFileMoveOutlinedIcon />}
          >
            {loading ? "Ko'chirilmoqda..." : "Ha, ko'chirishni boshlash"}
          </Button>
        )}
      </DialogActions>
    </DraggableDialog>
  );
}
