import React, { useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useTasksStore } from './useTasksStore';
import { Button, DialogActions, IconButton, Tooltip, Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Download, HelpOutlineOutlined, InsertDriveFile, Close } from '@mui/icons-material';
import InfoDialog from './InfoDialog';
import { useMutation } from '@tanstack/react-query';
import api from 'utils/api';
import { toast } from 'react-toastify';
import FileInputDrop from 'ui-component/FileInputDrop';

function SendExcelToTelegramGroupDialog() {
  const { t } = useTranslation();
  const { openSETTDialogDate, setOpenSETTDialogDate, openInfoDialog, setOpenInfoDialog } = useTasksStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. React Query useMutation - Telegramga yuborish
  const sendMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/fetchTelegram/send-excel-to-telegram', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('messages.successSend') || 'Excel muvaffaqiyatli yuborildi!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Xatolik yuz berdi');
    }
  });

  // 2. React Query useMutation - Shablon yuklab olish
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/download-templates/send-excel-to-group', { responseType: 'arraybuffer' });
      return data;
    },
    onSuccess: (data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'template.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(t('messages.templateDownloaded') || 'Shablon yuklab olindi');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Shablonni yuklashda xatolik');
    }
  });

  const handleClose = () => {
    setSelectedFile(null);
    setOpenSETTDialogDate(false);
  };

  const handleFilesChange = (filesList: FileList | null) => {
    if (filesList && filesList[0]) {
      setSelectedFile(filesList[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      sendMutation.mutate(selectedFile);
    }
  };

  return (
    <DraggableDialog open={openSETTDialogDate} onClose={handleClose} title={t('buttons.sendExcelToTelegramGroup')}>
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 420 }}>
        {!selectedFile ? (
          <FileInputDrop setFiles={handleFilesChange} fileType="excel" />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'primary.light',
              borderColor: 'primary.200'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
              <InsertDriveFile color="primary" />
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleRemoveFile} disabled={sendMutation.isPending}>
              <Close fontSize="small" />
            </IconButton>
          </Paper>
        )}
      </Box>

      <DialogActions sx={{ pt: 2, px: 0, pb: 0 }}>
        <Tooltip title={t('importAktsPage.downloadTemplate')} arrow>
          <span>
            <IconButton onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
              {downloadMutation.isPending ? <CircularProgress size={20} /> : <Download />}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t('importAktsPage.info')} arrow>
          <IconButton onClick={() => setOpenInfoDialog(true)}>
            <HelpOutlineOutlined />
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <Button onClick={handleClose} color="inherit" disabled={sendMutation.isPending}>
          {t('buttons.cancel') || 'Bekor qilish'}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedFile || sendMutation.isPending}
          startIcon={sendMutation.isPending ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {sendMutation.isPending ? t('buttons.sending') || 'Yuborilmoqda...' : t('buttons.continue')}
        </Button>
      </DialogActions>

      <InfoDialog openInfoDialog={openInfoDialog} setOpenInfoDialog={setOpenInfoDialog} />
    </DraggableDialog>
  );
}

export default SendExcelToTelegramGroupDialog;
