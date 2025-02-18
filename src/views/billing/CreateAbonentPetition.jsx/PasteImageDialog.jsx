import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React, { useState } from 'react';
import useStore from './useStore';
import { toast } from 'react-toastify';
import api from 'utils/api';

const PasteImageDialog = ({ open = true, setOpen }) => {
  const { setImages, images } = useStore();
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handlePaste = (e) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        setImageFile(file);

        // Faylni ko'rish uchun preview yarating
        const url = URL.createObjectURL(file);
        setPreview(url);
        break;
      }
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setImageFile(null);
    setPreview(null);
  };

  const handleAddButtonClick = async () => {
    if (!imageFile) {
      toast.error('Rasm tanlanmagan');
      return;
    }
    const formData = new FormData();
    formData.append('file', imageFile);
    const document_id = (
      await api.post('/fetchTelegram/create-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    ).data.document_id;
    setImages([...images, { file: imageFile, document_id: document_id }]);
    setImageFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <div
          onPaste={handlePaste}
          style={{
            border: '2px dashed #ccc',
            padding: '20px',
            textAlign: 'center',
            width: '300px',
            margin: '20px auto'
          }}
        >
          <p>Rasmni buferga nusxa olib, bu yerga "Ctrl + V" qiling</p>
          {preview && <img src={preview} alt="Pasted" style={{ maxWidth: '100%' }} />}
          {imageFile && <p>Fayl nomi: {imageFile.name}</p>}
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="outlined" onClick={handleCloseDialog}>
          Chiqish
        </Button>
        <Button color="primary" variant="contained" onClick={handleAddButtonClick} disabled={!imageFile}>
          Qo'shish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasteImageDialog;
