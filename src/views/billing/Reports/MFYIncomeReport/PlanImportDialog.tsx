import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface PlanImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PlanImportDialog({ open, onClose, onSuccess }: PlanImportDialogProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await api.get('/reports/mfy-incomes/plan-template', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Mahalla_Reja_Shablon.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel shabloni muvaffaqiyatli yuklandi');
    } catch (err) {
      console.error('Download template error:', err);
      toast.error('Shablonni yuklab olishda xatolik yuz berdi');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.warning('Faqat Excel (.xlsx yoki .xls) formatdagi fayllarni yuklash mumkin');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.warning('Iltimos, avval to‘ldirilgan Excel faylni tanlang');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/reports/mfy-incomes/import-plan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.ok) {
        toast.success(res.data.message || 'Mahallalar rejasi muvaffaqiyatli saqlandi!');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.data?.error || 'Rejalarni import qilishda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Import plan error:', err);
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Faylni import qilishda xatolik yuz berdi');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (importing) return;
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CloudUploadIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Mahallalar Rejasini Excel orqali Import Qilish
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" disabled={importing}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Step 1: Download Template */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
              1-qadam: Shablonni yuklab oling
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              Shablonda korxonangizga tegishli barcha mahallalar va ularning ID raqamlari joylashgan.
              &quot;Reja (so‘m)&quot; ustuniga har bir mahalla uchun belgilangan reja summasini kiriting.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={downloadingTemplate ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {downloadingTemplate ? 'Yuklanmoqda...' : 'Excel Shablonni Yuklab Olish'}
            </Button>
          </Box>

          {/* Step 2: Upload Filled File */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              2-qadam: To‘ldirilgan faylni yuklang
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              To‘ldirilgan .xlsx yoki .xls faylni tanlang va tizimga kiriting.
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="plan-excel-file-input"
            />

            {!selectedFile ? (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: `2px dashed ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.action.hover, 0.4),
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Faylni tanlash uchun bu yerga bosing
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Faqat .xlsx va .xls formatlar qo‘llab-quvvatlanadi
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <DescriptionIcon color="success" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={importing}
                >
                  O‘chirish
                </Button>
              </Box>
            )}
          </Box>

          <Alert severity="info" sx={{ '& .MuiAlert-message': { fontSize: '0.85rem' } }}>
            Belgilangan reja kiritilgach, hisobot sahifasida <strong>&quot;Belgilangan reja bo‘yicha&quot;</strong> rejimini
            tanlash orqali yangilangan ko‘rsatkichlarni ko‘rishingiz mumkin.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={handleClose} color="inherit" disabled={importing}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleImport}
          disabled={!selectedFile || importing}
          startIcon={importing ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {importing ? 'Yuklanmoqda...' : 'Import Qilish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
