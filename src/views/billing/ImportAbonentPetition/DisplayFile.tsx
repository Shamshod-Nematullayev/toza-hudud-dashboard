import React, { useState, useEffect } from 'react';
import useStore from './useStore';
import { Card, Paper } from '@mui/material';
import api from 'utils/api';
import PdfViewer from '../AbonentPetition/PDFViewer';
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(`${reader.result}`); // Base64 natija
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob); // Blobni o'qish va base64ga aylantirish
  });
};

function DisplayFile() {
  const { currentFile, ariza } = useStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [openImages, setOpenImages] = useState(false);
  useEffect(() => {
    setPhotos([]);
    ariza?.photos?.forEach((file_id) => {
      api.get(`/fetchTelegram/${file_id}`, { responseType: 'blob' }).then(async (blob) => {
        const base64 = await blobToBase64(blob.data);
        setPhotos((prev) => [...prev, base64]);
      });
    });
  }, [ariza]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
        // outline: 'none'
      }}
    >
      <PdfViewer base64String={currentFile?.url} />
      {ariza?.photos?.length && (
        <Paper
          sx={{
            width: '100%',
            boxShadow: 1,
            position: 'absolute',
            transition: 0.5,
            bottom: openImages ? 0 : '-100px'
          }}
        >
          <Card
            sx={{
              boxShadow: 1,
              position: 'relative',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              padding: '0 10px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setOpenImages(!openImages);
              console.log(openImages);
            }}
          >
            <b>Rasmlar</b>
            {photos?.map((photo, i) => {
              return <img key={i} src={photo} alt="" width="100%" />;
            })}
          </Card>
        </Paper>
      )}
    </div>
  );
}

export default DisplayFile;
