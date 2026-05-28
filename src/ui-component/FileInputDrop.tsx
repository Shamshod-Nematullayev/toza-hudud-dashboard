import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// styled-components o'rniga MUI o'ziniki import qilindi
import { styled, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { CloudUpload } from '@mui/icons-material';

// MUIning o'z dynamic styled komponenti - theme xavfsiz va kafolatlangan!
const StyledDropZone = styled('label')(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: '48px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  textAlign: 'center',
  fontFamily: '"Inter", sans-serif',
  fontWeight: 500,
  fontSize: '18px',
  cursor: 'pointer',
  borderRadius: '20px',
  color: theme.palette.text.secondary,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
      : `linear-gradient(145deg, #ffffff, ${theme.palette.grey[100]})`,
  border: `2px dashed ${theme.palette.primary.main}`,
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'translateY(-3px)',
    background: theme.palette.action.hover,
    boxShadow: `0 12px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'}`
  },

  '&.drop-zone--over': {
    borderStyle: 'solid',
    borderColor: theme.palette.primary.dark,
    boxShadow: `0 0 0 4px ${theme.palette.primary.main}33`
  },

  '& .drop-zone__input': {
    display: 'none'
  }
}));

function FileInputDrop({
  setFiles,
  clearTrigger,
  fileType = 'pdf'
}: {
  setFiles: (files: FileList | null) => void;
  clearTrigger: boolean;
  fileType?: 'pdf' | 'excel';
}) {
  const dropZoneRef = useRef<HTMLLabelElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [label, setLabel] = useState(fileType === 'pdf' ? 'PDF ' + t('Drop your files') : 'Excel ' + t('Drop your files'));

  useEffect(() => {
    if (clearTrigger) {
      handleClear();
    }
  }, [clearTrigger]);

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLabel(fileType === 'pdf' ? 'PDF ' + t('Drop your files') : 'Excel ' + t('Drop your files'));
  };

  const updateThumbnail = useCallback((file: File) => {
    if (!file) return;
    setLabel(file.name);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      dropZoneRef.current?.classList.remove('drop-zone--over');

      if (!e.dataTransfer) return;
      const files = e.dataTransfer.files;
      if (files.length && fileInputRef.current) {
        fileInputRef.current.files = files;
        updateThumbnail(files[0]);
        setFiles(files);
      }
    },
    [setFiles, updateThumbnail]
  );

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropZone.classList.add('drop-zone--over');
    };

    const handleDragLeave = () => {
      dropZone.classList.remove('drop-zone--over');
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [handleDrop]);

  return (
    <StyledDropZone ref={dropZoneRef}>
      <input
        type="file"
        className="drop-zone__input"
        ref={fileInputRef}
        accept={fileType === 'pdf' ? '.pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            updateThumbnail(e.target.files[0]);
          }
          setFiles(e.target.files);
        }}
      />

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Stack sx={{ alignItems: 'center', direction: 'column' }} spacing={2}>
          <CloudUpload sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5 }} />
          <Typography variant="h4" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {fileType === 'pdf'
              ? t('Davom etish uchun PDF fayl(lar)ni tizimga kiriting')
              : t('Davom etish uchun Excel faylni tizimga kiriting')}
          </Typography>
        </Stack>
      </motion.div>
    </StyledDropZone>
  );
}

export default FileInputDrop;
