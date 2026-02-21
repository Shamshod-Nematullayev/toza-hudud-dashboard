import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  .drop-zone {
    width: 100%;
    height: 100%;
    padding: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;

    text-align: center;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 18px;

    cursor: pointer;
    border-radius: 20px;

    color: ${({ theme }) => theme.palette.text.secondary};

    background: ${({ theme }) =>
      theme.palette.mode === 'dark'
        ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
        : `linear-gradient(145deg, #ffffff, ${theme.palette.grey[100]})`};

    border: 2px dashed ${({ theme }) => theme.palette.primary.main};

    transition: all 0.3s ease;
  }

  .drop-zone:hover {
    transform: translateY(-3px);
    background: ${({ theme }) => theme.palette.action.hover};
    box-shadow: 0 12px 30px
      ${({ theme }) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)')};
  }

  .drop-zone--over {
    border-style: solid;
    border-color: ${({ theme }) => theme.palette.primary.dark};
    box-shadow: 0 0 0 4px
      ${({ theme }) => theme.palette.primary.main}33;
  }

  .drop-zone__input {
    display: none;
  }

  .drop-zone__thumb {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    overflow: hidden;

    background-color: ${({ theme }) => theme.palette.background.default};
    background-size: cover;
    background-position: center;

    position: relative;
  }

  .drop-zone__thumb::after {
    content: attr(data-label);
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;

    padding: 12px 0;
    font-size: 13px;
    font-weight: 500;

    color: #fff;

    background: ${({ theme }) =>
      theme.palette.mode === 'dark'
        ? 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)'
        : 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)'};
  }
`;

function FileInputDrop({ setFiles, clearTrigger }: { setFiles: (files: FileList | null) => void; clearTrigger: boolean }) {
  const dropZoneRef = useRef<HTMLLabelElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [label, setLabel] = useState('PDF ' + t('Drop your files'));
  useEffect(() => {
    if (clearTrigger) {
      handleClear();
    }
  }, [clearTrigger]);
  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Inputni tozalash
    }
    setLabel('PDF ' + t('Drop your files'));
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

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drop-zone--over');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--over'));
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', (e) => e.preventDefault());
      dropZone.removeEventListener('dragleave', () => dropZone.classList.remove('drop-zone--over'));
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [handleDrop]);

  return (
    <>
      <GlobalStyles />
      <label className="drop-zone" ref={dropZoneRef}>
        <input
          type="file"
          className="drop-zone__input"
          ref={fileInputRef}
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files) updateThumbnail(e.target.files[0]);
            setFiles(e.target.files);
          }}
        />
        <div className="drop-zone__prompt">{label}</div>
      </label>
    </>
  );
}

export default FileInputDrop;
