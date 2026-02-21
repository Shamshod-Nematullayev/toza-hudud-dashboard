import React, { useRef, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import useStore from './useStore';
import { useTranslation } from 'react-i18next';

const CustomStyle = createGlobalStyle`
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
function FileInputDrop() {
  const { t } = useTranslation();
  const dropZoneRef = useRef<HTMLLabelElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================|States|================================================
  const { setPdfFiles } = useStore();

  useEffect(() => {
    const dropZoneElement = dropZoneRef.current;
    const inputElement = fileInputRef.current;

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      dropZoneElement?.classList.remove('drop-zone--over');

      if (e.dataTransfer && e.dataTransfer.files.length) {
        (inputElement as HTMLInputElement).files = e.dataTransfer.files;
        updateThumbnail(dropZoneElement as HTMLLabelElement, e.dataTransfer.files[0]);
        const files = Array.from(e.dataTransfer.files).filter((file) => file.type === 'application/pdf');
        const filesWithUrl: { file: File; url: string; blob: Blob }[] = [];
        const promises = files.map((file) => {
          return new Promise((resolve, reject) => {
            (async () => {
              try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);
                filesWithUrl.push({
                  file,
                  url,
                  blob: pdfBlob
                });
                resolve('Successfully');
              } catch (error) {
                reject(error);
              }
            })();
          });
        });
        await Promise.all(promises);
        setPdfFiles(filesWithUrl);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropZoneElement?.classList.add('drop-zone--over');
    };

    const handleDragLeave = () => {
      dropZoneElement?.classList.remove('drop-zone--over');
    };

    const handleClick = () => {
      inputElement?.click();
    };

    const handleChange = () => {
      if (inputElement?.files?.length) {
        updateThumbnail(dropZoneElement as HTMLLabelElement, inputElement.files[0]);
      }
    };

    dropZoneElement?.addEventListener('click', handleClick);
    dropZoneElement?.addEventListener('dragover', handleDragOver);
    dropZoneElement?.addEventListener('dragleave', handleDragLeave);
    dropZoneElement?.addEventListener('dragend', handleDragLeave);
    dropZoneElement?.addEventListener('drop', handleDrop);
    inputElement?.addEventListener('change', handleChange);

    return () => {
      dropZoneElement?.removeEventListener('click', handleClick);
      dropZoneElement?.removeEventListener('dragover', handleDragOver);
      dropZoneElement?.removeEventListener('dragleave', handleDragLeave);
      dropZoneElement?.removeEventListener('dragend', handleDragLeave);
      dropZoneElement?.removeEventListener('drop', handleDrop);
      inputElement?.removeEventListener('change', handleChange);
    };
  }, []);

  const updateThumbnail = (dropZoneElement: HTMLLabelElement, file: File) => {
    let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');

    if (!thumbnailElement) {
      thumbnailElement = document.createElement('div') as HTMLDivElement;
      thumbnailElement.classList.add('drop-zone__thumb');
      dropZoneElement.appendChild(thumbnailElement);
    }

    if (dropZoneElement.querySelector('.drop-zone__prompt')) {
      dropZoneElement.querySelector('.drop-zone__prompt')?.remove();
    }

    if (!thumbnailElement) {
      thumbnailElement = document.createElement('div');
      thumbnailElement.classList.add('drop-zone__thumb');
      dropZoneElement.appendChild(thumbnailElement);
    }

    (thumbnailElement as HTMLDivElement).dataset.label = file.name;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        (thumbnailElement as HTMLDivElement).style.backgroundImage = `url('${reader.result}')`;
      };
    } else {
      (thumbnailElement as HTMLDivElement).style.backgroundImage = 'none';
    }
  };
  return (
    <>
      <CustomStyle />
      <label className="drop-zone" ref={dropZoneRef}>
        <input
          type="file"
          name="myFile"
          className="drop-zone__input"
          disabled
          ref={fileInputRef}
          accept=".pdf"
          style={{ display: 'none' }}
        />
        <div className="drop-zone__prompt">{t('Drop your files')}</div>
      </label>
    </>
  );
}

export default FileInputDrop;
