import { useState } from 'react';
import DraggableDialog from './extended/DraggableDialog';
import { Button, DialogActions, DialogContent } from '@mui/material';
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

  const handlePaste = (e: ClipboardEvent) => {
    if (e.clipboardData === null) return;
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file === null) return;
        setFile(file);

        // Faylni ko'rish uchun preview yaratish
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        break;
      }
    }
  };

  const handleCloseDialog = () => {
    onClose();
    setFile(null);
    setPreviewUrl('');
  };

  const handleAddButtonClick = () => {
    if (file) {
      onAddButtonClick(file);
      setFile(null);
      setPreviewUrl('');
    }
  };
  return (
    <DraggableDialog open={open} title={title} onClose={onClose}>
      <DialogContent>
        <div
          onPaste={(e) => handlePaste(e as any)}
          style={{
            border: '2px dashed #ccc',
            padding: '20px',
            textAlign: 'center',
            width: '300px',
            margin: '20px auto'
          }}
        >
          <p>Rasmni buferga nusxa olib, bu yerga "Ctrl + V" qiling</p>
          {previewUrl && <img src={previewUrl} alt="Pasted" style={{ maxWidth: '100%' }} />}
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="outlined" onClick={handleCloseDialog}>
          {t('buttons.close')}
        </Button>
        <Button color="primary" variant="contained" onClick={handleAddButtonClick} disabled={!file}>
          {t('buttons.add')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default PasteImageDialog;
