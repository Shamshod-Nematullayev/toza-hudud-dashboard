import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  .drop-zone {
    width: 100%;
    height: 100%;
    padding: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 20px;
    cursor: pointer;
    color: #ccc;
    border: 4px dashed #009578;
    border-radius: 10px;
    transition: border 0.3s ease;
  }
  .drop-zone--over {
    border-style: solid;
  }
  .drop-zone__input {
    display: none;
  }
  .drop-zone__thumb {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background-color: #ccc;
    background-size: cover;
    position: relative;
  }
  .drop-zone__thumb::after {
    content: attr(data-label);
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 5px;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    font-size: 14px;
    text-align: center;
  }
`;

function FileInputDrop({ setFiles, clearTrigger }) {
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);
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
  const updateThumbnail = useCallback((file) => {
    if (!file) return;
    setLabel(file.name);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      dropZoneRef.current.classList.remove('drop-zone--over');

      const files = e.dataTransfer.files;
      if (files.length) {
        fileInputRef.current.files = files;
        updateThumbnail(files[0]);
        setFiles(files);
      }
    },
    [setFiles, updateThumbnail]
  );

  useEffect(() => {
    const dropZone = dropZoneRef.current;

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
            updateThumbnail(e.target.files[0]);
            setFiles(e.target.files);
          }}
        />
        <div className="drop-zone__prompt">{label}</div>
      </label>
    </>
  );
}

export default FileInputDrop;
