import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ClearIcon from '@mui/icons-material/Clear';
import { toast } from 'react-toastify';

import FileInputDrop from 'ui-component/FileInputDrop';
import api from 'utils/api';
import useOdamSoniXatlovStore from '../odamSoniXatlovStore';

interface ImportXatlovExcelModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportXatlovExcelModal({ open, onClose }: ImportXatlovExcelModalProps) {
  const { toggleRefresh } = useOdamSoniXatlovStore();
  const [file, setFile] = useState<File | null>(null);
  const [clearTrigger, setClearTrigger] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState<any>(null);

  const handleReset = () => {
    setFile(null);
    setResultSummary(null);
    setSubmitting(false);
    setClearTrigger((prev) => !prev);
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await api.get('/yashovchi-soni-xatlov/download-template', { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'xatlov_import_template.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Shablon yuklab olindi');
    } catch (err: any) {
      toast.error('Shablonni yuklab olishda xatolik kuzatildi');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return toast.error('Excel faylini tanlang');
    }

    setSubmitting(true);
    setResultSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/yashovchi-soni-xatlov/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.ok) {
        toast.success(data.message || 'Excel fayli muvaffaqiyatli import qilindi');
        setResultSummary(data);
        toggleRefresh();
      } else {
        toast.error(data.message || 'Import qilishda xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Import so‘rovida xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FileUploadOutlinedIcon color="primary" />
        Excel orqali ommaviy xatlov import qilish
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">
              Excel faylida 2 ta ustun bo‘lishi lozim: <strong>KOD</strong> (Hisob raqam) va <strong>YASHOVCHILAR</strong> (yangi odam soni).
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={downloadingTemplate ? <CircularProgress size={16} /> : <DownloadOutlinedIcon />}
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate || submitting}
              >
                {downloadingTemplate ? 'Yuklanmoqda...' : 'Excel shablonini yuklab olish'}
              </Button>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Excel faylini surib kelib tashlang yoki tanlang (.xlsx, .xls):
              </Typography>
              {file ? (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <InsertDriveFileIcon color="success" fontSize="large" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={submitting}
                    onClick={() => {
                      setFile(null);
                      setClearTrigger((prev) => !prev);
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <FileInputDrop
                  fileType="excel"
                  setFiles={(files) => {
                    if (files && files.length > 0) {
                      setFile(files[0]);
                    } else {
                      setFile(null);
                    }
                  }}
                  clearTrigger={clearTrigger}
                />
              )}
            </Paper>

            {resultSummary && (
              <Alert severity={resultSummary.createdCount > 0 ? 'success' : 'warning'}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Import natijasi:
                </Typography>
                <Typography variant="body2">
                  • Qo'shilganlar: <strong>{resultSummary.createdCount}</strong> ta
                </Typography>
                <Typography variant="body2">
                  • O'tkazib yuborilgan/xatolar: <strong>{resultSummary.skippedCount}</strong> ta
                </Typography>
                {resultSummary.errors && resultSummary.errors.length > 0 && (
                  <Box sx={{ mt: 1, maxHeight: 100, overflowY: 'auto' }}>
                    {resultSummary.errors.map((err: string, idx: number) => (
                      <Typography key={idx} variant="caption" color="error" sx={{ display: 'block' }}>
                        {err}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleCloseModal} disabled={submitting}>
            Yopish
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || !file}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <FileUploadOutlinedIcon />}
          >
            {submitting ? 'Import qilinmoqda...' : 'Import qilish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
