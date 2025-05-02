import { PublishedWithChanges, RestartAlt, Update } from '@mui/icons-material';
import { IconButton, TextField, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useLoaderStore from 'store/loaderStore';
import api from 'utils/api';
import useArizaStore from './useStore';
import { toast } from 'react-toastify';

function Tools() {
  const { setIsLoading } = useLoaderStore(); // noto‘g‘ri: setIsLoader
  const { ariza_id } = useParams();
  const { setAriza, setAktFileURL, setShowModal, updatePage } = useArizaStore();
  const [documentNumber, setDocumentNumber] = useState('');
  const navigate = useNavigate();
  const updateActDetails = async () => {
    setIsLoading(true);
    try {
      const newAriza = (await api.put('/arizalar/updateFromBilling/' + ariza_id)).data.ariza;
      try {
        const base64File = (
          await api.get('/billing/get-file/', {
            params: { file_id: newAriza.aktInfo.fileId }
          })
        ).data.file;
        setAktFileURL(base64File); // Base64 ni iframe ga joylaymiz
      } catch (error) {}
      setAriza(newAriza);
      toast.success('Yangilandi!');
    } catch (error) {
      console.error(error);
      toast.error('xatolik yuz berdi!');
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeydown = async (e) => {
    if (e.key === 'Enter') {
      let ariza = (
        await api.get('/arizalar', {
          params: {
            document_number: documentNumber
          }
        })
      ).data.data;
      if (ariza.length < 1) {
        return toast.error("Ma'lumot topilmadi");
      } else if (ariza.length > 1) {
        return toast.error("Qidiruv natijalari ko'p");
      }

      ariza = ariza[0];
      navigate('/billing/recalculation/' + ariza._id);
    }
  };
  return (
    <div
      style={{
        height: 50
      }}
    >
      <Tooltip title="tozamakon tizimidan yangilash" arrow placement="top">
        <IconButton onClick={updateActDetails}>
          <RestartAlt />
        </IconButton>
      </Tooltip>
      <Tooltip title="Qayta akt qilish" arrow placement="top">
        <IconButton onClick={() => setShowModal(true)}>
          <PublishedWithChanges />
        </IconButton>
      </Tooltip>
      <TextField
        placeholder="Boshqa arizaga o`tish"
        type="number"
        value={documentNumber}
        onChange={(e) => setDocumentNumber(e.target.value)}
        onKeyDown={handleKeydown}
      />
    </div>
  );
}

export default Tools;
