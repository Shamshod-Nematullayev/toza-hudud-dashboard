import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  Close,
  FolderOpenOutlined,
  ContentPasteOutlined,
  InsertPhotoOutlined
} from '@mui/icons-material';
import useArizaStore from './useStore';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useTranslation } from 'react-i18next';

interface PasteImageDialogProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const PasteImageDialog: React.FC<PasteImageDialogProps> = ({ open = true, setOpen }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { ariza, setAriza } = useArizaStore();
  const theme = useTheme();

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('messages.onlyImages', 'Faqat rasm fayllari qabul qilinadi (.png, .jpg, .jpeg, .webp)'));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error(t('messages.fileTooLarge', 'Rasm hajmi 15MB dan oshmasligi kerak'));
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

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

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClearSelection = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseDialog = () => {
    if (loading) return;
    handleClearSelection();
    setOpen(false);
  };

  const handleAddButtonClick = async () => {
    if (!imageFile) {
      toast.error(t('messages.selectImage', 'Rasm tanlanmagan'));
      return;
    }
    if (!ariza?._id) {
      toast.error(t('messages.error', 'Ariza ma’lumotlari topilmadi'));
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', imageFile);

      const docRes = await api.post('/fetchTelegram/create-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const document_id = docRes.data?.document_id;

      if (!document_id) {
        throw new Error('Hujjat ID olinmadi');
      }

      const updateRes = await api.put(`/arizalar/add-image/${ariza._id}`, { file_id: document_id });
      const updatedAriza = updateRes.data?.ariza;
      if (updatedAriza) {
        setAriza(updatedAriza);
      }

      toast.success(t('messages.imageAttached', 'Rasm muvaffaqiyatli biriktirildi!'));
      handleCloseDialog();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t('messages.error', 'Rasm biriktirishda xatolik yuz berdi'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)'
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (th) => alpha(th.palette.primary.main, 0.1),
              color: 'primary.main'
            }}
          >
            <InsertPhotoOutlined fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('recalculationDetailPage.attachImage', 'Rasm biriktirish')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('recalculationDetailPage.attachSubtitle', 'Fayl tanlang, sudrab tashlang yoki clipboarddan qo‘ying')}
            </Typography>
          </Box>
        </Stack>

        <IconButton size="small" onClick={handleCloseDialog} disabled={loading} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Dropzone & Paste Area */}
        <Box
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!imageFile) {
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          sx={{
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : imageFile ? 'success.main' : 'divider',
            borderRadius: 3,
            p: 3,
            textAlign: 'center',
            cursor: imageFile ? 'default' : 'pointer',
            mt: 1,
            outline: 'none',
            bgcolor: isDragOver
              ? (th) => alpha(th.palette.primary.main, 0.08)
              : imageFile
                ? (th) => alpha(th.palette.success.main, 0.03)
                : (th) => (th.palette.mode === 'dark' ? alpha(th.palette.common.white, 0.02) : 'grey.50'),
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: (th) => alpha(th.palette.primary.main, 0.04)
            },
            '&:focus-visible': {
              borderColor: 'primary.main'
            }
          }}
        >
          {preview ? (
            /* Selected Image Preview State */
            <Box>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  maxWidth: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  p: 1
                }}
              >
                <img
                  src={preview}
                  alt="Selected Preview"
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: 240,
                    objectFit: 'contain',
                    borderRadius: 6,
                    margin: '0 auto'
                  }}
                />

                <Tooltip title={t('tableActions.remove', 'O‘chirish')}>
                  <IconButton
                    size="small"
                    onClick={handleClearSelection}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'error.main', color: 'common.white' }
                    }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {imageFile?.name}
                </Typography>
                {imageFile && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ({formatFileSize(imageFile.size)})
                  </Typography>
                )}
              </Stack>

              <Button
                size="small"
                variant="text"
                color="primary"
                startIcon={<FolderOpenOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                sx={{ mt: 1 }}
              >
                {t('recalculationDetailPage.chooseAnother', 'Boshqa rasm tanlash')}
              </Button>
            </Box>
          ) : (
            /* Empty Upload / Paste / Dropzone State */
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: (th) => alpha(th.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 0.5
                }}
              >
                <CloudUploadOutlined sx={{ fontSize: 32 }} />
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('recalculationDetailPage.dropOrPickImage', 'Rasmni bu yerga sudrab tashlang yoki tanlang')}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, fontSize: '0.85rem' }}>
                {t(
                  'recalculationDetailPage.pasteOrPickDesc',
                  'Kompyuterdan fayl tanlash uchun bosing yoki rasmni nusxalab (Ctrl + V) joylashtiring'
                )}
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ pt: 1, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FolderOpenOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {t('recalculationDetailPage.selectFile', 'Faylni tanlash')}
                </Button>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {t('common.or', 'yoki')}
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: 'center',
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: (th) => alpha(th.palette.text.primary, 0.05),
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ContentPasteOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Ctrl + V
                  </Typography>
                </Stack>
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', pt: 1 }}>
                {t('recalculationDetailPage.allowedFormats', 'PNG, JPG, JPEG, WEBP (maksimal 15 MB)')}
              </Typography>
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}
      >
        <Button color="inherit" onClick={handleCloseDialog} disabled={loading}>
          {t('tableActions.cancel', 'Bekor qilish')}
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleAddButtonClick}
          disabled={!imageFile || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlined />}
          sx={{ minWidth: 120, borderRadius: 2 }}
        >
          {loading ? t('loading', 'Yuklanmoqda...') : t('buttons.attach', 'Biriktirish')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasteImageDialog;
