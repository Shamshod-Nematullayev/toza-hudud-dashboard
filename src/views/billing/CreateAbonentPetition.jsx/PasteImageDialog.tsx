import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Stack,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import { CloudUpload, DeleteOutlineOutlined, ContentPaste, Image as ImageIcon, Close } from '@mui/icons-material';
import { useStore, ImgType } from './useStore';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useTranslation } from 'react-i18next';

interface PasteImageDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PasteImageDialog: React.FC<PasteImageDialogProps> = ({ open, setOpen }) => {
  const { setImages, images } = useStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('Faqat rasm fayllari qabul qilinadi (.png, .jpg, .jpeg)'));
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleProcessFile(file);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleAddButtonClick = async () => {
    if (!selectedFile) {
      toast.error(t('createAbonentPetitionPage.pictureNotPicked'));
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await api.post('/fetchTelegram/create-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const document_id = res.data.document_id;
      setImages([...images, { file: selectedFile, document_id: document_id }]);
      toast.success(t("Rasm muvaffaqiyatli qo'shildi"));
      setSelectedFile(null);
      setPreview(null);
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(t('Rasm yuklashda xatolik yuz berdi'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ImageIcon color="primary" />
          <Typography variant="h4">{t('Hujjat rasmini yuklash')}</Typography>
        </Stack>
        <IconButton onClick={handleCloseDialog} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Drag-and-drop / Paste Zone */}
        <Box
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          sx={{
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease',
            outline: 'none',
            '&:focus': {
              borderColor: 'primary.main'
            },
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main'
              }}
            >
              <CloudUpload />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("Faylni tanlang yoki shu yerga tashlang")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              yoki clipboarddan <b>Ctrl + V</b> orqali joylang (PNG, JPG)
            </Typography>
          </Stack>
        </Box>

        {/* Selected file preview */}
        {preview && (
          <Box sx={{ mt: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
              {t("Yuklanayotgan rasm:")}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                component="img"
                src={preview}
                alt="Tanlangan rasm"
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                  {selectedFile?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddButtonClick();
                }}
                disabled={isUploading}
                startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <ContentPaste />}
              >
                {isUploading ? t('Yuklanmoqda...') : t("Qo'shish")}
              </Button>
            </Stack>
          </Box>
        )}

        {/* List of already added images */}
        {images.length > 0 && (
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t("Biriktirilgan rasmlar")} ({images.length})
            </Typography>
            <List dense disablePadding sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              {images.map((item, idx) => (
                <ListItem key={idx} divider={idx !== images.length - 1}>
                  <ImageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <ListItemText
                    primary={item.file?.name || `Rasm #${idx + 1}`}
                    secondary={item.file ? `${(item.file.size / 1024).toFixed(1)} KB` : item.document_id}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={t("O'chirish")}>
                      <IconButton edge="end" size="small" color="error" onClick={() => handleRemoveImage(idx)}>
                        <DeleteOutlineOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button color="inherit" onClick={handleCloseDialog}>
          {t('buttons.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasteImageDialog;
