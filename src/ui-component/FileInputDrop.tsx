import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styled, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { CloudUpload } from '@mui/icons-material';

const StyledDropZone = styled('label')(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: '32px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  textAlign: 'center',
  fontFamily: '"Inter", sans-serif',
  fontWeight: 500,
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '16px',
  color: theme.palette.text.secondary,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
      : `linear-gradient(145deg, #ffffff, ${theme.palette.grey[100]})`,
  border: `2px dashed ${theme.palette.primary.main}`,
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'translateY(-2px)',
    background: theme.palette.action.hover,
    boxShadow: `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}`
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

export interface FileInputDropProps {
  setFiles: (files: FileList | null) => void;
  clearTrigger?: boolean;
  fileType?: 'pdf' | 'excel';
  accept?: string;
}

function FileInputDrop({ setFiles, clearTrigger = false, fileType = 'pdf', accept }: FileInputDropProps) {
  const dropZoneRef = useRef<HTMLLabelElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const getDefaultLabel = useCallback(() => {
    return fileType === 'pdf' ? 'PDF ' + t('Drop your files') : 'Excel ' + t('Drop your files');
  }, [fileType, t]);

  const [label, setLabel] = useState<string>(getDefaultLabel());

  useEffect(() => {
    if (clearTrigger) {
      handleClear();
    }
  }, [clearTrigger]);

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLabel(getDefaultLabel());
    setFiles(null);
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

  const defaultAccept =
    fileType === 'pdf'
      ? '.pdf'
      : '.xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';

  return (
    <StyledDropZone ref={dropZoneRef}>
      <input
        type="file"
        className="drop-zone__input"
        ref={fileInputRef}
        accept={accept || defaultAccept}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            updateThumbnail(e.target.files[0]);
            setFiles(e.target.files);
          } else {
            setFiles(null);
          }
        }}
      />

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Stack sx={{ alignItems: 'center' }} spacing={1.5}>
          <CloudUpload sx={{ fontSize: 56, color: 'primary.main', opacity: 0.7 }} />
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
