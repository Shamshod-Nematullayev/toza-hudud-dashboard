import React from 'react';
import { Close, Download } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Box, Typography } from '@mui/material';
import PdfViewer from 'views/billing/AbonentPetition/PDFViewer';

interface FileViewerModalProps {
  open: boolean;
  fileData: {
    base64: string;
    mimeType: string;
    fileName: string;
    fileUrl?: string;
  } | null;
  handleClose: () => void;
}

export function FileViewerModal({ open, fileData, handleClose }: FileViewerModalProps) {
  if (!open || !fileData) return null;

  const { base64, mimeType, fileName, fileUrl } = fileData;

  const isPdf = mimeType.includes('pdf');
  const isImage = mimeType.startsWith('image/');
  const isTxt = mimeType.includes('text') || mimeType.includes('json');

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = fileUrl || `data:${mimeType};base64,${base64}`;
    link.download = fileName || 'fayl';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isPdf || fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <Box sx={{ width: '100%', height: '100%' }}>
          <PdfViewer base64String={base64} />
        </Box>
      );
    }

    if (isImage || /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName)) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: 2,
            bgcolor: 'background.default'
          }}
        >
          <img
            src={fileUrl || `data:${mimeType || 'image/png'};base64,${base64}`}
            alt={fileName}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
          />
        </Box>
      );
    }

    if (isTxt) {
      let textContent = '';
      try {
        textContent = atob(base64);
      } catch (e) {
        textContent = 'Matnni o\'qishda xatolik';
      }
      return (
        <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
          <Typography component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {textContent}
          </Typography>
        </Box>
      );
    }

    // Try rendering inside object / iframe for standard browser supported formats
    if (fileUrl) {
      return (
        <object
          data={fileUrl}
          type={mimeType}
          style={{ width: '100%', height: '100%', border: 'none' }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 4,
              textAlign: 'center',
              gap: 2
            }}
          >
            <Typography variant="h5" color="text.primary">
              Ushbu fayl turini brauzerda ko'rsatib bo'lmadi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fayl nomi: {fileName}
            </Typography>
            <Button variant="contained" color="primary" startIcon={<Download />} onClick={downloadFile}>
              Faylni yuklab olish
            </Button>
          </Box>
        </object>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} maxWidth="xl" onClose={handleClose} fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
          {fileName || 'Faylni ko\'rish'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" onClick={downloadFile} title="Yuklab olish">
            <Download />
          </IconButton>
          <IconButton size="small" onClick={handleClose} title="Yopish">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ width: '100%', height: '80vh', p: 0 }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

export default FileViewerModal;
