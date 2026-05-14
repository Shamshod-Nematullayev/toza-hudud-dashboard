import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import api from 'utils/api';
import PdfViewer from '../AbonentPetition/PDFViewer';
import useStore from './hooks/useStore';
import { motion } from 'framer-motion';
import { PictureAsPdfOutlined } from '@mui/icons-material';

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

function DisplayFile() {
  const { currentFile, ariza } = useStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    setPhotos([]);
    setIsOpen(false);
    ariza?.tempPhotos?.forEach((file_id) => {
      api.get(`/fetchTelegram/${file_id}`, { responseType: 'blob' }).then(async (res) => {
        const base64 = await blobToBase64(res.data);
        setPhotos((prev) => [...prev, base64]);
      });
    });
  }, [ariza]);

  const hasPhotos = !!ariza?.tempPhotos?.length;
  const hasFile = !!currentFile?.url;

  return (
    <Box position="relative" width="100%" height="100%" overflow="hidden">
      {hasFile ? (
        <PdfViewer base64String={currentFile?.url || ''} />
      ) : (
        /* PDF Placeholder - So'zlarsiz vizual ko'rsatma */
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" width="100%" style={{ border: '1px solid' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                color: 'text.disabled'
              }}
            >
              <PictureAsPdfOutlined sx={{ fontSize: 120, opacity: 0.2 }} />
              <Box
                sx={{
                  width: 60,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'divider'
                }}
              />
            </Box>
          </motion.div>
        </Box>
      )}
      {hasPhotos && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          sx={{
            transform: isOpen ? 'translateY(-10px)' : 'translateY(100px)',
            transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
          }}
        >
          {/* Handle */}
          <Box
            onClick={() => setIsOpen((p) => !p)}
            sx={{
              background: 'rgba(30,30,30,0.92)',
              backdropFilter: 'blur(12px)',
              borderTop: '0.5px solid rgba(255,255,255,0.12)',
              px: 2,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {/* icon + label */}
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Rasmlar</span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 20
                }}
              >
                {photos.length} ta
              </span>
            </Box>
            <span
              style={{
                color: 'rgba(255,255,255,0.5)',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                display: 'inline-block'
              }}
            >
              ↑
            </span>
          </Box>

          {/* Grid */}
          <Box
            sx={{
              background: 'rgba(20,20,20,0.95)',
              backdropFilter: 'blur(12px)',
              p: 1.5,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 1,
              maxHeight: 220,
              overflowY: 'auto'
            }}
          >
            {photos.map((src, i) => (
              <Box
                key={i}
                onClick={() => setLightboxSrc(src)}
                sx={{
                  borderRadius: 1,
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  cursor: 'pointer',
                  opacity: 1,
                  '&:hover': { outline: '2px solid rgba(255,255,255,0.3)' }
                }}
              >
                <img src={src} alt={`Rasm ${i + 1}`} width="100%" height="100%" style={{ objectFit: 'cover', display: 'block' }} />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <Box
          onClick={() => setLightboxSrc(null)}
          position="absolute"
          sx={{ inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
        >
          <img
            src={lightboxSrc}
            alt="Kattalashtirish"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8, objectFit: 'contain' }}
          />
        </Box>
      )}
    </Box>
  );
}

export default DisplayFile;
