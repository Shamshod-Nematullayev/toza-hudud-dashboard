import React, { useState, useRef } from 'react';
import DraggableDialog from './extended/DraggableDialog';
import { Button, DialogActions, DialogContent, Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { CloudUploadOutlined, FolderOpenOutlined, DeleteOutlined } from '@mui/icons-material';
import { t } from 'i18next';

interface Params {
  open: boolean;
  title?: string;
  onClose: () => void;
  onAddButtonClick: (imgFile: File) => void;
}

function PasteImageDialog({ open, title = '', onClose, onAddButtonClick }: Params) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          handleProcessFile(pastedFile);
          break;
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleCloseDialog = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddButtonClick = () => {
    if (file) {
      onAddButtonClick(file);
      handleCloseDialog();
    }
  };

  return (
    <DraggableDialog open={open} title={title || t('recalculationDetailPage.attachImage', 'Rasm biriktirish')} onClose={handleCloseDialog}>
      <DialogContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <Box
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => {
            if (!file) {
              fileInputRef.current?.click();
            }
          }}
          sx={{
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: file ? 'default' : 'pointer',
            maxWidth: 380,
            mx: 'auto',
            my: 1,
            outline: 'none',
            bgcolor: isDragOver ? 'action.hover' : 'background.paper',
            '&:hover': {
              borderColor: 'primary.main'
            }
          }}
        >
          {previewUrl ? (
            <Box>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                <Tooltip title={t('tableActions.remove', 'O‘chirish')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                {file?.name}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
              <CloudUploadOutlined sx={{ fontSize: 36, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {t('recalculationDetailPage.dropOrPickImage', 'Rasmni bu yerga sudrab tashlang yoki tanlang')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('recalculationDetailPage.pasteHint', 'Yoki Ctrl + V qiling')}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderOpenOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                {t('recalculationDetailPage.selectFile', 'Faylni tanlash')}
              </Button>
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="outlined" onClick={handleCloseDialog}>
          {t('buttons.close', 'Yopish')}
        </Button>
        <Button color="primary" variant="contained" onClick={handleAddButtonClick} disabled={!file}>
          {t('buttons.add', 'Qo‘shish')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default PasteImageDialog;
