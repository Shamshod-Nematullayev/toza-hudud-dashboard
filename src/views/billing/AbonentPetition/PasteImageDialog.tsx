import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import useArizaStore from './useStore';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useTranslation } from 'react-i18next';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

interface PasteImageDialogProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}

const PasteImageDialog: React.FC<PasteImageDialogProps> = ({ open = true, setOpen }) => {
  const { t } = useTranslation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { ariza, setAriza } = useArizaStore();

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
          const url = URL.createObjectURL(file);
          setPreview(url);
        }
        break;
      }
    }
  };

  const handleCloseDialog = () => {
    if (loading) return;
    setOpen(false);
    setImageFile(null);
    setPreview(null);
  };

  const handleAddButtonClick = async () => {
    if (!imageFile) {
      toast.error(t('messages.selectImage', 'Rasm tanlanmagan'));
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      const document_id = (
        await api.post('/fetchTelegram/create-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      ).data.document_id;
      const data = (await api.put('/arizalar/add-image/' + ariza._id, { file_id: document_id })).data.ariza;
      setAriza(data);
      toast.success(t('messages.success', 'Rasm biriktirildi'));
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('messages.error', 'Xatolik kuzatildi'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {t('recalculationDetailPage.attachImage', 'Rasm biriktirish')}
      </DialogTitle>
      <DialogContent>
        <Box
          onPaste={handlePaste}
          tabIndex={0}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            mt: 1,
            outline: 'none',
            '&:focus': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t('recalculationDetailPage.pasteHint', 'Rasmni clipboarddan nusxalang va "Ctrl + V" bosing')}
          </Typography>
          {preview && (
            <Box sx={{ mt: 2, maxHeight: 180, overflow: 'hidden', borderRadius: 1 }}>
              <img src={preview} alt="Pasted" style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }} />
            </Box>
          )}
          {imageFile && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {imageFile.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={handleCloseDialog} disabled={loading}>
          {t('tableActions.cancel', 'Bekor qilish')}
        </Button>
        <Button color="primary" variant="contained" onClick={handleAddButtonClick} disabled={!imageFile || loading}>
          {loading ? t('loading', 'Yuklanmoqda...') : t('buttons.add', 'Qo‘shish')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasteImageDialog;
