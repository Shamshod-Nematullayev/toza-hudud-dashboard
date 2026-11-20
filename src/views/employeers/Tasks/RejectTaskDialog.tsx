import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloseOutlined,
  PictureAsPdfOutlined,
  DeleteOutlined,
  DoDisturbOnOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useTasksStore } from './useTasksStore';

export const REJECT_REASON_TYPES = [
  "Elektr hisob raqami yuridik hisob raqami bo'lgani uchun",
  "Mahallada mavjud emas/yashamaydi bo'lgani uchun",
  "Eski hisoblagich hali zamonaviy hisob raqami yo'q",
  "Elektr hisoblagichi umuman yo'q! Pryaqmoy ishlatadi huquqbuzar",
  "Yangi elektr hisoblagichi hali hisob raqami berilmagan",
  "Boshqa sabab"
];

export default function RejectTaskDialog() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    openRejectDialog,
    rejectTargetTask,
    handleCloseRejectDialog,
    triggerRefresh,
    fetchStats
  } = useTasksStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reasonType, setReasonType] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const resetForm = () => {
    setSelectedFile(null);
    setReasonType('');
    setCustomReason('');
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    handleCloseRejectDialog();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.warning('Faqat PDF (.pdf) formatidagi hujjat qabul qilinadi! Rasm yuklash mumkin emas.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!rejectTargetTask) return;

    if (!reasonType) {
      toast.warning("Bajarib bo'lmaslik asosini (sabab turini) tanlang!");
      return;
    }

    if (reasonType === 'Boshqa sabab' && !customReason.trim()) {
      toast.warning("Iltimos, sababni batafsil yozib qoldiring!");
      return;
    }

    if (!selectedFile && !rejectTargetTask.fileId) {
      toast.warning("Asoslantiruvchi PDF hujjat yuklanishi shart!");
      return;
    }

    if (selectedFile) {
      const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.warning("Faqat PDF formatidagi faylni yuklash mumkin!");
        return;
      }
    }

    const finalReason = customReason.trim()
      ? (reasonType === 'Boshqa sabab' ? customReason.trim() : `${reasonType} (${customReason.trim()})`)
      : reasonType;

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('rejectedReasonType', reasonType);
      formData.append('reason', finalReason);
      formData.append('purpose', finalReason);
      if (rejectTargetTask.fileId && !selectedFile) {
        formData.append('fileId', rejectTargetTask.fileId);
      }

      const res = await api.post(`/tasks/${rejectTargetTask._id}/reject-unexecutable`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.ok) {
        toast.success(res.data?.message || "Topshiriq 'Bajarib bo'lmaydi' statusi bilan yakunlandi");
        handleClose();
        triggerRefresh();
        fetchStats();
      } else {
        toast.error(res.data?.message || "Xatolik yuz berdi");
      }
    } catch (err: any) {
      console.error('[RejectTaskDialog] error:', err);
      toast.error(err?.response?.data?.message || err?.message || "Topshiriqni yakunlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (!rejectTargetTask) return null;

  return (
    <Dialog
      open={openRejectDialog}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0.5
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DoDisturbOnOutlined color="error" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Topshiriqni bajarib bo'lmaydi deb yakunlash
          </Typography>
        </Stack>
        <IconButton size="small" onClick={handleClose} disabled={submitting}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Ushbu topshiriq <strong>«Bajarib bo'lmaydi» (rejected)</strong> holatiga o'tkaziladi. Asos turini tanlang va Telegram bazasiga
          asoslantiruvchi <strong>PDF hujjat</strong> yuklang. Rasm qabul qilinmaydi.
        </Alert>

        {/* Abonent haqida qisqacha ma'lumot */}
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.grey[100], 0.7)
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>Hisob raqam:</strong> {rejectTargetTask.accountNumber}
            </Typography>
            <Typography variant="body2">
              <strong>F.I.O:</strong> {rejectTargetTask.fullName}
            </Typography>
            {rejectTargetTask.nazoratchiName && (
              <Typography variant="body2">
                <strong>Biriktirilgan inspektor:</strong> {rejectTargetTask.nazoratchiName}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Asos turi (Dropdown) */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.8 }}>
            Asos turi (Bekor qilish sababi) <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl fullWidth size="medium">
            <InputLabel id="reject-reason-type-label">Asos turini tanlang</InputLabel>
            <Select
              labelId="reject-reason-type-label"
              value={reasonType}
              label="Asos turini tanlang"
              onChange={(e) => setReasonType(e.target.value)}
              disabled={submitting}
            >
              {REJECT_REASON_TYPES.map((item) => (
                <MenuItem key={item} value={item} sx={{ whiteSpace: 'normal', py: 1 }}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Sabab kiritish / Qo'shimcha izoh */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {reasonType === 'Boshqa sabab' ? (
              <>
                Sabab tafsiloti <span style={{ color: 'red' }}>*</span>
              </>
            ) : (
              "Qo'shimcha izoh / tafsilotlar (ixtiyoriy)"
            )}
          </Typography>
          <TextField
            multiline
            rows={2.5}
            fullWidth
            placeholder={
              reasonType === 'Boshqa sabab'
                ? "Bajarib bo'lmaslik sababini batafsil yozing..."
                : "Masalan: Dalolatnoma raqami yoki qo'shimcha ma'lumot..."
            }
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            disabled={submitting}
          />
        </Box>

        {/* Fayl yuklash zonasi - FAQAT PDF */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Asoslantiruvchi hujjat (faqat PDF) <span style={{ color: 'red' }}>*</span>
          </Typography>

          {!selectedFile ? (
            <Box
              component="label"
              sx={{
                border: '2px dashed',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                cursor: 'pointer',
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.error.main, 0.02),
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  bgcolor: isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.error.main, 0.05)
                }
              }}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                hidden
                onChange={handleFileChange}
                disabled={submitting}
              />
              <PictureAsPdfOutlined sx={{ fontSize: 36, color: 'error.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                PDF hujjatni tanlash uchun bosing
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Faqat PDF (.pdf) formati qabul qilinadi
              </Typography>
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: 'error.main',
                bgcolor: isDark ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.error.main, 0.04)
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', overflow: 'hidden' }}>
                <PictureAsPdfOutlined color="error" />
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB (PDF hujjat)
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small" color="error" onClick={() => setSelectedFile(null)} disabled={submitting}>
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <DoDisturbOnOutlined />}
          sx={{ borderRadius: 2, px: 2.5 }}
        >
          {submitting ? 'Yuklanmoqda...' : "Bajarib bo'lmaydi deb yakunlash"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
