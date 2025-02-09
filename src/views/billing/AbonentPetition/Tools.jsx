import { PublishedWithChanges, RestartAlt, Update } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import useLoaderStore from 'store/loaderStore';
import api from 'utils/api';
import useArizaStore from './useStore';
import { toast } from 'react-toastify';

function Tools() {
  const {setIsLoading} = useLoaderStore()
  const {ariza_id} = useParams()
  const {setAriza, setAktFileURL, setShowModal} = useArizaStore()
  const updateActDetails = async () => {
    setIsLoading(true); 
    try {
      const newAriza = (await api.put('/arizalar/updateFromBilling/' + ariza_id)).data.ariza;
      const base64File = (
        await api.get('/billing/get-file/', {
          params: { file_id: newAriza.aktInfo.fileId }
        })
      ).data.file;
      setAktFileURL(base64File); // Base64 ni iframe ga joylaymiz
      setAriza(newAriza)
      toast.success('Yangilandi!');
    } catch (error) {
      console.error(error)
      toast.error('xatolik yuz berdi!');
    }finally{
      setIsLoading(false); 
    }
  }
  return (
    <div
      style={{
        height: 50
      }}
    >
      <Tooltip title="tozamakon tizimidan yangilash" arrow placement="top"  >
      <IconButton onClick={updateActDetails}>
        <RestartAlt />
      </IconButton>
      </Tooltip>
      <Tooltip title="Qayta akt qilish" arrow placement="top"  >
      <IconButton onClick={() => setShowModal(true)}>
        <PublishedWithChanges  />
      </IconButton>
      </Tooltip>
    </div>
  );
}

export default Tools;
